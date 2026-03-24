require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const catsRoutes = require('./routes/catsRoutes');
const adoptionsRoutes = require('./routes/adoptionsRoutes');
const logsRoutes = require('./routes/logsRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501'
];

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return cb(null, true);
        }
        return cb(new Error('Origin not allowed by CORS'));
    }
}));

app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'Meowtopia Backend API',
            health: '/api/health',
            auth: '/api/auth',
            cats: '/api/cats',
            adoptions: '/api/adoptions',
            logs: '/api/logs/sql'
        }
    });
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        data: {
            message: 'API is running',
            health: '/api/health'
        }
    });
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/cats', catsRoutes);
app.use('/api/adoptions', adoptionsRoutes);
app.use('/api/logs', logsRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorMiddleware);

module.exports = app;
