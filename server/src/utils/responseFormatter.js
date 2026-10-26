// Standard API Response and Error Formatters
// Backend Concept: Consistent API Contracts

export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res, statusCode, message, details = null) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details ? { details } : {})
    }
  });
};
