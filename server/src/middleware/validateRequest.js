// Request Validation Middleware
// Backend Concept: Server-side validation before business logic

import { ApiError } from '../utils/responseFormatter.js';
import { ORDER_STATUSES } from '../utils/statusTransitions.js';

export const validateCreateMenuItem = (req, res, next) => {
  const { name, description, price, isAvailable } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Item name is required and cannot be empty.');
  } else if (name.trim().length > 100) {
    errors.push('Item name cannot exceed 100 characters.');
  }

  const parsedPrice = parseFloat(price);
  if (price === undefined || price === null || isNaN(parsedPrice)) {
    errors.push('A valid numeric price is required.');
  } else if (parsedPrice <= 0) {
    errors.push('Price must be greater than zero.');
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push('Description must be a valid text string.');
  }

  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    errors.push('isAvailable must be a boolean value.');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed for menu item.', errors));
  }

  req.body.name = name.trim();
  req.body.price = parsedPrice;
  req.body.description = description ? description.trim() : null;
  req.body.isAvailable = isAvailable !== undefined ? isAvailable : true;
  next();
};

export const validateUpdateMenuItem = (req, res, next) => {
  const { name, description, price, isAvailable } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Item name cannot be empty.');
    } else if (name.trim().length > 100) {
      errors.push('Item name cannot exceed 100 characters.');
    }
  }

  if (price !== undefined) {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.push('Price must be a valid number greater than zero.');
    } else {
      req.body.price = parsedPrice;
    }
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('Description must be a valid text string.');
  }

  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    errors.push('isAvailable must be a boolean value.');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed for update.', errors));
  }

  if (name !== undefined) req.body.name = name.trim();
  if (description !== undefined && description !== null) req.body.description = description.trim();
  next();
};

export const validateCreateOrder = (req, res, next) => {
  const { studentName, studentId, pickupTime, items } = req.body;
  const errors = [];

  if (!studentName || typeof studentName !== 'string' || studentName.trim().length < 2) {
    errors.push('Student name is required (minimum 2 characters).');
  }

  if (!studentId || typeof studentId !== 'string' || studentId.trim().length < 2) {
    errors.push('Student ID / Roll Number is required.');
  }

  if (!pickupTime || typeof pickupTime !== 'string' || pickupTime.trim().length === 0) {
    errors.push('Pickup time is required.');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one food item (empty order rejected).');
  } else {
    items.forEach((item, index) => {
      const itemIndex = index + 1;
      const menuItemId = parseInt(item.menuItemId, 10);
      const quantity = parseInt(item.quantity, 10);

      if (isNaN(menuItemId) || menuItemId <= 0) {
        errors.push(`Item #${itemIndex}: Valid menuItemId is required.`);
      }

      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Item #${itemIndex}: Quantity must be a positive integer greater than zero.`);
      }
    });
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed for order submission.', errors));
  }

  // Sanitize values
  req.body.studentName = studentName.trim();
  req.body.studentId = studentId.trim();
  req.body.pickupTime = pickupTime.trim();
  req.body.items = items.map(item => ({
    menuItemId: parseInt(item.menuItemId, 10),
    quantity: parseInt(item.quantity, 10)
  }));

  next();
};

export const validateUpdateOrderStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status || typeof status !== 'string') {
    return next(new ApiError(400, 'Order status is required.'));
  }

  const normalizedStatus = status.trim().toUpperCase();
  if (!ORDER_STATUSES[normalizedStatus]) {
    return next(new ApiError(400, `Invalid status "${status}". Allowed values: ${Object.values(ORDER_STATUSES).join(', ')}`));
  }

  req.body.status = normalizedStatus;
  next();
};
