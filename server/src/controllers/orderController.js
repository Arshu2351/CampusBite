// Order Controller Layer
// Backend Concept: HTTP Request/Response handling & status codes

import { orderService } from '../services/orderService.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const orderController = {
  /**
   * GET /api/orders
   * Optional query param: ?status=PLACED
   */
  async getOrders(req, res, next) {
    try {
      const status = req.query.status ? req.query.status.toUpperCase() : null;
      const orders = await orderService.getAllOrders(status);
      return sendSuccess(res, 200, 'Orders retrieved successfully.', orders);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/orders/stats
   * Aggregated counts for staff dashboard
   */
  async getOrderStats(req, res, next) {
    try {
      const stats = await orderService.getOrderStats();
      return sendSuccess(res, 200, 'Order summary stats retrieved.', stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/orders/:id
   */
  async getOrderById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const order = await orderService.getOrderById(id);
      return sendSuccess(res, 200, 'Order retrieved successfully.', order);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/orders
   * Places an order within a database transaction
   */
  async createOrder(req, res, next) {
    try {
      const newOrder = await orderService.placeOrder(req.body);
      return sendSuccess(res, 201, 'Order placed successfully! Please pay at the counter.', newOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/orders/:id/status
   * Updates status with state transition validation
   */
  async updateOrderStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const updatedOrder = await orderService.updateOrderStatus(id, req.body.status);
      return sendSuccess(res, 200, `Order #${id} status updated to ${req.body.status}.`, updatedOrder);
    } catch (error) {
      next(error);
    }
  }
};
