import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import cron from 'node-cron';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import subscriptionRoutes from './routes/subscription.js';
import scoreRoutes from './routes/score.js';
import charityRoutes from './routes/charity.js';
import drawRoutes from './routes/draw.js';
import adminRoutes from './routes/admin.js';


import { runMonthlyDraw } from './utils/drawEngine.js';

const app = express();
const PORT = process.env.PORT || 10000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP'
});

app.use(helmet());
app.use(limiter);
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'https://golflinks-1-frontend.onrender.com' // We'll update this later
    ],
    credentials: true
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/charity', charityRoutes);
app.use('/api/draw', drawRoutes);
app.use('/api/admin', adminRoutes);

cron.schedule('0 0 1 * *', () => {
    console.log('Running monthly draw...');
    runMonthlyDraw();
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});