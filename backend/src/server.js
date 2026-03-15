const app = require('./app');
const pool = require('./config/db');

const port = Number(process.env.PORT || 5000);
const requiredDbVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

function getMissingEnvVars() {
    return requiredDbVars.filter((key) => !process.env[key] || String(process.env[key]).trim() === '');
}

function formatStartupError(err) {
    if (!err) return 'Unknown error while connecting to database.';
    if (typeof err === 'string') return err;

    const parts = [];
    if (err.code) parts.push(`code=${err.code}`);
    if (err.errno !== undefined) parts.push(`errno=${err.errno}`);
    if (err.sqlState) parts.push(`sqlState=${err.sqlState}`);
    if (err.message) parts.push(`message=${err.message}`);

    if (parts.length) {
        return parts.join(', ');
    }
    return JSON.stringify(err);
}

async function start() {
    try {
        const missing = getMissingEnvVars();
        if (missing.length) {
            console.error('Failed to start backend: Missing environment variables:', missing.join(', '));
            process.exit(1);
        }

        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();

        app.listen(port, () => {
            console.log(`Meowtopia backend running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to start backend:', formatStartupError(err));
        console.error('Hint: Install and start MySQL, then verify backend/.env DB values.');
        process.exit(1);
    }
}

start();
