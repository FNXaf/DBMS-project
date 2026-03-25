const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../../database/logs');
const LOG_FILE = path.join(LOG_DIR, 'sql-query-log.jsonl');

fs.mkdirSync(LOG_DIR, { recursive: true });

function normalizeSql(sql) {
    return String(sql || '').replace(/\s+/g, ' ').trim();
}

function inferQueryType(sql) {
    const match = normalizeSql(sql).match(/^([A-Z]+)/i);
    return match ? match[1].toUpperCase() : 'UNKNOWN';
}

function inferTable(sql, queryType) {
    const normalized = normalizeSql(sql);
    if (queryType === 'SELECT') {
        const m = normalized.match(/\bFROM\s+`?([A-Za-z0-9_]+)`?/i);
        return m ? m[1] : null;
    }
    if (queryType === 'INSERT') {
        const m = normalized.match(/\bINTO\s+`?([A-Za-z0-9_]+)`?/i);
        return m ? m[1] : null;
    }
    if (queryType === 'UPDATE') {
        const m = normalized.match(/^UPDATE\s+`?([A-Za-z0-9_]+)`?/i);
        return m ? m[1] : null;
    }
    if (queryType === 'DELETE') {
        const m = normalized.match(/\bFROM\s+`?([A-Za-z0-9_]+)`?/i);
        return m ? m[1] : null;
    }
    return null;
}

function sanitizeValue(value) {
    if (value === null || value === undefined) return value;
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (value instanceof Date) return value.toISOString();
    const str = String(value);
    if (str.length > 180) return `${str.slice(0, 180)}...`;
    return str;
}

function sanitizeParams(sql, params) {
    if (!params) return params;

    const lowerSql = normalizeSql(sql).toLowerCase();
    const hideSensitive = lowerSql.includes('password');

    if (Array.isArray(params)) {
        return params.map((p) => (hideSensitive ? '[REDACTED]' : sanitizeValue(p)));
    }

    if (typeof params === 'object') {
        const out = {};
        Object.keys(params).forEach((key) => {
            const keySensitive = /password|token|secret/i.test(key);
            out[key] = hideSensitive || keySensitive ? '[REDACTED]' : sanitizeValue(params[key]);
        });
        return out;
    }

    return hideSensitive ? '[REDACTED]' : sanitizeValue(params);
}

function inferRowCount(queryResult) {
    const rows = queryResult && queryResult[0];
    if (Array.isArray(rows)) return rows.length;
    if (rows && typeof rows === 'object') {
        if (typeof rows.affectedRows === 'number') return rows.affectedRows;
        if (typeof rows.insertId === 'number' && rows.insertId > 0) return 1;
    }
    return null;
}

// Render SQL exactly as executed by replacing placeholders with sanitized literals.
function toSqlLiteral(value) {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
    const str = String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${str}'`;
}

function renderSqlWithParams(sql, params) {
    const normalizedSql = normalizeSql(sql);
    if (!normalizedSql || params === null || params === undefined) return normalizedSql;

    if (Array.isArray(params)) {
        let index = 0;
        return normalizedSql.replace(/\?/g, () => {
            const next = index < params.length ? params[index] : null;
            index += 1;
            return toSqlLiteral(next);
        });
    }

    if (typeof params === 'object') {
        return normalizedSql.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (full, key) => {
            if (!Object.prototype.hasOwnProperty.call(params, key)) return full;
            return toSqlLiteral(params[key]);
        });
    }

    return normalizedSql.replace(/\?/, toSqlLiteral(params));
}

function inferEventTag(queryType, table, sql) {
    const tbl = String(table || '').toLowerCase();
    const normalizedSql = normalizeSql(sql).toLowerCase();

    if (queryType === 'INSERT' && tbl === 'cat') return 'CAT_CREATE';
    if (queryType === 'UPDATE' && tbl === 'cat') return 'CAT_UPDATE';
    if (queryType === 'DELETE' && tbl === 'cat') return 'CAT_DELETE';
    if (queryType === 'INSERT' && tbl === 'adoption') return 'ADOPTION_CREATE';
    if (queryType === 'UPDATE' && tbl === 'adoption' && normalizedSql.includes('status')) return 'ADOPTION_STATUS_UPDATE';
    if (queryType === 'UPDATE' && tbl === 'adoption') return 'ADOPTION_UPDATE';
    if (queryType === 'DELETE' && tbl === 'adoption') return 'ADOPTION_DELETE';
    return 'OTHER';
}

function buildQueryDescription({ queryType, table, eventTag, renderedSql, rowCount, success, error }) {
    const tbl = String(table || '').toLowerCase();
    const sql = normalizeSql(renderedSql || '').toLowerCase();

    if (!success) {
        if (eventTag === 'ADOPTION_CREATE') {
            return 'The app tried to submit an adoption request, but it was rejected.';
        }
        if (eventTag === 'CAT_CREATE') {
            return 'The app tried to add a new cat, but it was rejected.';
        }
        if (tbl === 'cat') {
            return 'The app could not load cat details for this action.';
        }
        if (tbl === 'adoption') {
            return 'The app could not complete the adoption-related action.';
        }
        if (tbl === 'user') {
            return 'The app could not complete the user-related action.';
        }
        return `The app action failed${error ? '.' : '.'}`;
    }

    if (eventTag === 'CAT_CREATE') return 'Adds a new cat to the shelter listing from the Admin panel.';
    if (eventTag === 'CAT_UPDATE') return 'Saves updated cat details from the Admin panel.';
    if (eventTag === 'CAT_DELETE') return 'Removes a cat from the shelter listing in the Admin panel.';
    if (eventTag === 'ADOPTION_CREATE') return 'Records a new adoption request when a user adopts a cat.';
    if (eventTag === 'ADOPTION_STATUS_UPDATE') return 'Updates the adoption request status from the Admin Adoptions page.';
    if (eventTag === 'ADOPTION_UPDATE') return 'Saves changes to an existing adoption request.';
    if (eventTag === 'ADOPTION_DELETE') return 'Removes an adoption request record.';

    if (sql.includes('from availablecats')) {
        return 'Fetches available cats to display on the Browse Cats page.';
    }

    if (sql.includes('from adminadoptionoverview')) {
        return 'Loads adoption requests with related details for the Admin Adoptions page.';
    }

    if (sql.includes('from allcatswithage')) {
        return 'Loads full cat records for admin review with age details.';
    }

    if (queryType === 'SELECT' && tbl === 'cat') {
        if (sql.includes('where catid =')) {
            return 'Loads one cat profile for the cat details or edit flow.';
        }
        if (sql.includes('is_available = true')) {
            return 'Fetches available cats to display in the public cat listing.';
        }
        return 'Loads cat data for the app screens.';
    }

    if (queryType === 'SELECT' && tbl === 'adoption') {
        if (sql.includes('where a.userid =') || sql.includes('where userid =')) {
            return 'Shows a user their own adoption requests on the dashboard.';
        }
        return 'Shows adoption request records on the app screens.';
    }

    if (queryType === 'SELECT' && tbl === 'user') {
        return 'Loads user account data needed for login, auth, or admin display.';
    }

    if (queryType === 'INSERT' && tbl === 'user') {
        return 'Creates a new user account during registration.';
    }

    if (queryType === 'UPDATE' && tbl === 'cat' && sql.includes('is_available = false')) {
        return 'Marks a cat as adopted so it no longer appears as available.';
    }

    if (queryType === 'UPDATE' && tbl === 'cat' && sql.includes('is_available = true')) {
        return 'Marks a cat as available again after adoption rejection/cancellation.';
    }

    if (queryType === 'UPDATE' && tbl === 'adoption' && sql.includes('status')) {
        return 'Changes the adoption request status in the Admin workflow.';
    }

    if (queryType === 'DELETE' && tbl === 'cat') {
        return 'Deletes a cat entry from the Admin panel.';
    }

    if (queryType === 'DELETE' && tbl === 'adoption') {
        return 'Deletes an adoption request record from admin data.';
    }

    if (queryType === 'SELECT') return 'Loads data needed to show the current app page.';
    if (queryType === 'INSERT') return 'Creates a new record for the current app action.';
    if (queryType === 'UPDATE') return 'Updates an existing record for the current app action.';
    if (queryType === 'DELETE') return 'Removes a record for the current app action.';

    return 'Executes a database action needed by the app.';
}

function toArrayFilter(value) {
    if (value === undefined || value === null || value === '') return [];
    if (Array.isArray(value)) return value.map((v) => String(v || '').trim().toUpperCase()).filter(Boolean);
    return String(value)
        .split(',')
        .map((v) => v.trim().toUpperCase())
        .filter(Boolean);
}

function toBooleanFilter(value) {
    if (value === undefined || value === null || value === '' || value === 'all') return null;
    const normalized = String(value).toLowerCase().trim();
    if (normalized === 'true' || normalized === '1' || normalized === 'success') return true;
    if (normalized === 'false' || normalized === '0' || normalized === 'error') return false;
    return null;
}

function matchesFilters(log, filters = {}) {
    const queryTypes = toArrayFilter(filters.queryType);
    const tables = toArrayFilter(filters.table);
    const events = toArrayFilter(filters.event);
    const success = toBooleanFilter(filters.success);
    const search = String(filters.search || '').trim().toLowerCase();

    if (queryTypes.length && !queryTypes.includes(String(log.queryType || '').toUpperCase())) return false;
    if (tables.length && !tables.includes(String(log.table || '').toUpperCase())) return false;
    if (events.length && !events.includes(String(log.eventTag || '').toUpperCase())) return false;
    if (success !== null && Boolean(log.success) !== success) return false;

    if (search) {
        const haystack = [
            log.sql,
            log.renderedSql,
            log.queryType,
            log.table,
            log.eventTag,
            log.queryDescription,
            log.source,
            log.error
        ]
            .map((part) => String(part || '').toLowerCase())
            .join(' ');
        if (!haystack.includes(search)) return false;
    }

    return true;
}

async function logSqlQuery({ source, sql, params, queryResult, durationMs, success, errorMessage }) {
    try {
        const queryType = inferQueryType(sql);
        const normalizedSql = normalizeSql(sql);

        const payload = {
            timestamp: new Date().toISOString(),
            source: source || 'pool',
            queryType,
            table: inferTable(normalizedSql, queryType),
            eventTag: null,
            queryDescription: '',
            durationMs: Number(durationMs || 0),
            success: Boolean(success),
            rowCount: success ? inferRowCount(queryResult) : null,
            sql: normalizedSql,
            renderedSql: renderSqlWithParams(normalizedSql, params),
            params: sanitizeParams(normalizedSql, params),
            error: success ? null : String(errorMessage || 'Unknown SQL error')
        };

        payload.eventTag = inferEventTag(payload.queryType, payload.table, payload.sql);
        payload.queryDescription = buildQueryDescription({
            queryType: payload.queryType,
            table: payload.table,
            eventTag: payload.eventTag,
            renderedSql: payload.renderedSql,
            rowCount: payload.rowCount,
            success: payload.success,
            error: payload.error
        });

        await fs.promises.appendFile(LOG_FILE, `${JSON.stringify(payload)}\n`, 'utf8');
    } catch (_) {
        // Avoid breaking API calls when query logging fails.
    }
}

async function readRecentSqlLogs(limit = 200, filters = {}) {
    try {
        const safeLimit = Math.max(1, Math.min(Number(limit) || 200, 1000));
        const content = await fs.promises.readFile(LOG_FILE, 'utf8');
        const lines = content.split(/\r?\n/).filter(Boolean);
        const latest = lines.slice(-safeLimit).reverse();

        const parsed = latest.map((line) => {
            try {
                const log = JSON.parse(line);
                if (!log.queryDescription) {
                    log.queryDescription = buildQueryDescription({
                        queryType: log.queryType,
                        table: log.table,
                        eventTag: log.eventTag,
                        renderedSql: log.renderedSql || log.sql,
                        rowCount: log.rowCount,
                        success: log.success,
                        error: log.error
                    });
                }
                return log;
            } catch (_) {
                return {
                    timestamp: new Date().toISOString(),
                    success: false,
                    sql: line,
                    renderedSql: line,
                    queryDescription: 'Could not parse this log line into a valid SQL log object.',
                    params: [],
                    eventTag: 'OTHER',
                    error: 'Malformed log entry'
                };
            }
        });

        return parsed.filter((log) => matchesFilters(log, filters));
    } catch (err) {
        if (err && err.code === 'ENOENT') return [];
        throw err;
    }
}

async function clearSqlLogs() {
    await fs.promises.writeFile(LOG_FILE, '', 'utf8');
}

module.exports = {
    LOG_FILE,
    logSqlQuery,
    readRecentSqlLogs,
    clearSqlLogs
};
