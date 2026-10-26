// HTTP Server Entry Point
// Backend Concept: Environment Configuration & Process Lifecycle

import dotenv from 'dotenv';
import app from './app.js';
import prisma from './utils/prisma.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` CampusBite REST API Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Menu API:     http://localhost:${PORT}/api/menu`);
  console.log(` Orders API:   http://localhost:${PORT}/api/orders`);
  console.log(` Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Prisma disconnected from PostgreSQL database.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
