// Express Application Setup
// Backend Concept: Express Application Architecture & Middleware Pipeline

import express from 'express';
import cors from 'cors';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// 1. Core Middleware
app.use(cors({
  origin: '*', // Allow frontend development port
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 3. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusBite API'
  });
});

// 4. Resource Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// 5. 404 & Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
