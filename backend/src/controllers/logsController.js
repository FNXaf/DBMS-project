const { ok } = require('../utils/apiResponse');
const { readRecentSqlLogs, clearSqlLogs, LOG_FILE } = require('../utils/sqlLogger');

async function getSqlLogs(req, res, next) {
    try {
        const limit = Number(req.query.limit || 200);
        const logs = await readRecentSqlLogs(limit);
        return ok(res, {
            file: LOG_FILE,
            count: logs.length,
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
