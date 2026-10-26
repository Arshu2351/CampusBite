// Centralized Error Handling Middleware
// Backend Concept: Centralized Error Handler & Structured Responses

import { sendError, ApiError } from '../utils/responseFormatter.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  // 1. Handled Operational Errors
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.details);
  }

  // 2. Prisma Specific Known Errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return sendError(res, 409, 'A record with this unique field already exists.', {
          target: err.meta?.target
        });

      case 'P2003':
        return sendError(
          res,
          400,
          'Cannot perform this action because related records depend on it (Foreign key constraint violation).',
          err.meta
        );

      case 'P2025':
        return sendError(res, 404, 'The requested record was not found in the database.');

      default:
        return sendError(res, 400, `Database error (${err.code}): ${err.message}`);
    }
  }

  // 3. JSON Parsing Syntax Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'Malformed JSON payload in request body.');
  }

  // 4. Unhandled Internal Server Errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  return sendError(
    res,
    500,
    'An unexpected internal server error occurred.',
    isDevelopment ? err.stack : null
  );
};

export const notFound = (req, res, next) => {
  return sendError(res, 404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
};
