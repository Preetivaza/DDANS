import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Add this
import dotenv from 'dotenv';
import connectDB from './config/db.js';
// import authRoutes from './routes/AuthRoutes.js';
import authRoutes from './routes/authRoutes';

import DutyOrderRoutes from './routes/DutyOrderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import digitalSignatureRoutes from './routes/digitalSignatureRoutes.js';
import users from "./routes/userRoutes.js";
import stats from "./routes/statsRoutes.js";
import staffRoutes from './routes/staffRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';



dotenv.config();

const app = express();

// Middleware
// const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // your frontend origin
  credentials: true
}));

app.use(express.json());
app.use(cookieParser()); // Parse cookies

app.use('/files',express.static('public/files'));



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/duty-orders', DutyOrderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs',auditLogRoutes);
app.use('/api/digital-signatures',digitalSignatureRoutes);
app.use('/api/users',users);
app.use('/api/stats',stats);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/staff', staffRoutes);
// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
