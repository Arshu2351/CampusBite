// Menu Controller Layer
// Backend Concept: HTTP Request/Response handling & status codes

import { menuService } from '../services/menuService.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const menuController = {
  /**
   * GET /api/menu
   * Optional query param: ?available=true
   */
  async getMenuItems(req, res, next) {
    try {
      const availableOnly = req.query.available === 'true';
      const items = await menuService.getAllMenuItems(availableOnly);
      return sendSuccess(res, 200, 'Menu items retrieved successfully.', items);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/menu/:id
   */
  async getMenuItemById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await menuService.getMenuItemById(id);
      return sendSuccess(res, 200, 'Menu item retrieved successfully.', item);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/menu
   */
  async createMenuItem(req, res, next) {
    try {
      const newItem = await menuService.createMenuItem(req.body);
      return sendSuccess(res, 201, 'Menu item created successfully.', newItem);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/menu/:id
   */
  async updateMenuItem(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await menuService.updateMenuItem(id, req.body);
      return sendSuccess(res, 200, 'Menu item updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/menu/:id
   */
  async deleteMenuItem(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      await menuService.deleteMenuItem(id);
      return sendSuccess(res, 200, 'Menu item deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
};
