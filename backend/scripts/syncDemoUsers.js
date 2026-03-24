require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

async function upsertDemoUsers() {
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('sam123', 10);

    await pool.query(
        'INSERT INTO `User` (full_name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password = VALUES(password), phone = VALUES(phone), address = VALUES(address), role = VALUES(role)',
        ['Sam Badal', 'admin@meowtopia.com', adminHash, '9876543210', 'Meowtopia HQ', 'admin']
    );

    await pool.query(
        'INSERT INTO `User` (full_name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password = VALUES(password), phone = VALUES(phone), address = VALUES(address), role = VALUES(role)',
        ['User One', 'user1@example.com', userHash, '1234567890', '123 Cat Street, Mewville', 'user']
    );
}

upsertDemoUsers()
    .then(async () => {
        console.log('Demo users synced successfully.');
        await pool.end();
    })
    .catch(async (err) => {
        console.error('Failed to sync demo users:', err.message);
        try {
            await pool.end();
        } catch (_) {}
        process.exit(1);
    });
