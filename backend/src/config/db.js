const mysql = require('mysql2/promise');
const { logSqlQuery } = require('../utils/sqlLogger');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true
});

function wrapQueryRunner(sourceName, originalFn) {
    return async function wrappedQuery(sql, params) {
        const start = Date.now();
        try {
            const result = await originalFn(sql, params);
            await logSqlQuery({
                source: sourceName,
                sql,
                params,
                queryResult: result,
                durationMs: Date.now() - start,
                success: true
            });
            return result;
        } catch (err) {
            await logSqlQuery({
                source: sourceName,
                sql,
                params,
                durationMs: Date.now() - start,
                success: false,
                errorMessage: err && err.message ? err.message : 'Unknown SQL error'
            });
            throw err;
        }
    };
}

const originalPoolQuery = pool.query.bind(pool);
pool.query = wrapQueryRunner('pool.query', originalPoolQuery);

const originalGetConnection = pool.getConnection.bind(pool);
pool.getConnection = async function wrappedGetConnection() {
    const connection = await originalGetConnection();
    if (!connection.__sqlLogWrapped) {
        const originalConnQuery = connection.query.bind(connection);
        connection.query = wrapQueryRunner('connection.query', originalConnQuery);

        const originalConnExecute = connection.execute.bind(connection);
        connection.execute = wrapQueryRunner('connection.execute', originalConnExecute);

        connection.__sqlLogWrapped = true;
    }
    return connection;
};

module.exports = pool;
