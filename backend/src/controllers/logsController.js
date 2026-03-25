const { ok } = require('../utils/apiResponse');
const { readRecentSqlLogs, clearSqlLogs, LOG_FILE } = require('../utils/sqlLogger');

function parseLogFilters(query) {
    // Keep filter parsing in controller so DB/logger layer stays generic.
    return {
        queryType: query.queryType || '',
        table: query.table || '',
        event: query.event || '',
        success: query.success || 'all',
        search: query.search || ''
    };
}

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
