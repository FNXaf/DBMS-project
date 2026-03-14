const app = require('./app');
const pool = require('./config/db');

const port = Number(process.env.PORT || 5000);

async function start() {
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();

        app.listen(port, () => {
            console.log(`Meowtopia backend running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to start backend:', err.message);
        process.exit(1);
    }
}

start();
