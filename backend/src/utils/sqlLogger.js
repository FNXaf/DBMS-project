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

async function logSqlQuery({ source, sql, params, queryResult, durationMs, success, errorMessage }) {
    try {
        const queryType = inferQueryType(sql);
        const normalizedSql = normalizeSql(sql);

        const payload = {
            timestamp: new Date().toISOString(),
            source: source || 'pool',
            queryType,
            table: inferTable(normalizedSql, queryType),
            durationMs: Number(durationMs || 0),
            success: Boolean(success),
            rowCount: success ? inferRowCount(queryResult) : null,
            sql: normalizedSql,
            params: sanitizeParams(normalizedSql, params),
            error: success ? null : String(errorMessage || 'Unknown SQL error')
        };

        await fs.promises.appendFile(LOG_FILE, `${JSON.stringify(payload)}\n`, 'utf8');
    } catch (_) {
        // Avoid breaking API calls when query logging fails.
    }
}

async function readRecentSqlLogs(limit = 200) {
    try {
        const safeLimit = Math.max(1, Math.min(Number(limit) || 200, 1000));
        const content = await fs.promises.readFile(LOG_FILE, 'utf8');
        const lines = content.split(/\r?\n/).filter(Boolean);
        const latest = lines.slice(-safeLimit).reverse();

        return latest.map((line) => {
            try {
                return JSON.parse(line);
            } catch (_) {
                return {
                    timestamp: new Date().toISOString(),
                    success: false,
                    sql: line,
                    params: [],
                    error: 'Malformed log entry'
                };
            }
        });
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
