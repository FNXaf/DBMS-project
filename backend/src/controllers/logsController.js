// Controller to expose internal SQL logs (admin demo).
// These endpoints read/clear the log file produced by the
// SQL logger that `db.js` calls for every query.
const { ok } = require('../utils/apiResponse');
const { readRecentSqlLogs, clearSqlLogs, LOG_FILE } = require('../utils/sqlLogger');

// Parse simple query params for log filtering. Keeping this
// here keeps the logger generic (file IO) and controller
// responsible for shaping API-friendly filters.
function parseLogFilters(query) {
    return {
        queryType: query.queryType || '',
        table: query.table || '',
        event: query.event || '',
        success: query.success || 'all',
        search: query.search || ''
    };
}

// GET /logs/sql
// Return recent SQL log entries with simple filters.
async function getSqlLogs(req, res, next) {
    try {
        const limit = Number(req.query.limit || 200);
        const filters = parseLogFilters(req.query);
        const logs = await readRecentSqlLogs(limit, filters);
        return ok(res, {
            file: LOG_FILE,
            count: logs.length,
            filters,
            logs
        });
    } catch (err) {
        next(err);
    }
}

// DELETE /logs/sql
// Clear the SQL log file (admin action).
async function deleteSqlLogs(req, res, next) {
    try {
        await clearSqlLogs();
        return ok(res, { message: 'SQL logs cleared', file: LOG_FILE });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getSqlLogs,
    deleteSqlLogs
};
