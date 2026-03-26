// Database pool and SQL logging wrapper.
// This file creates a MySQL connection pool used by the app
// and wraps query/execute calls so every SQL statement is
// recorded by the SQL logger for demo / debugging purposes.
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

// Wraps a query runner (pool.query / connection.query / execute)
// so the call is logged (sql, params, duration, success/error).
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

// Replace pool.query with a wrapped version that logs queries.
const originalPoolQuery = pool.query.bind(pool);
pool.query = wrapQueryRunner('pool.query', originalPoolQuery);

// Ensure connections retrieved from the pool also have logging.
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
