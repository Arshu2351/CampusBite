// Database Client Singleton
// Advanced Database Concept: Connection Pooling & ORM Client Management

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

export default prisma;
