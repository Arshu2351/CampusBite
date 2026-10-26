// Menu Service Layer
// Backend Concept: Business Logic & Data Validation

import { menuRepository } from '../repositories/menuRepository.js';
import { ApiError } from '../utils/responseFormatter.js';

export const menuService = {
  /**
   * Get all menu items
   * @param {boolean} availableOnly - If true, returns only items where isAvailable === true
   */
  async getAllMenuItems(availableOnly = false) {
    const filter = availableOnly ? { isAvailable: true } : {};
    return menuRepository.findAll(filter);
  },

  /**
   * Get a single menu item by ID
   */
  async getMenuItemById(id) {
    const item = await menuRepository.findById(id);
    if (!item) {
      throw new ApiError(404, `Menu item with ID ${id} was not found.`);
    }
    return item;
  },

  /**
   * Create a new menu item
   */
  async createMenuItem(data) {
    return menuRepository.create(data);
  },

  /**
   * Update an existing menu item
   */
  async updateMenuItem(id, data) {
    // Check existence first
    await this.getMenuItemById(id);
    return menuRepository.update(id, data);
  },

  /**
   * Delete a menu item safely
   * Foreign Key Protection Strategy:
   * Checks if this item has been used in any historical orders.
   * If yes, rejects deletion with 400 Bad Request to protect historical order records.
   */
  async deleteMenuItem(id) {
    const item = await this.getMenuItemById(id);

    const orderCount = await menuRepository.countOrderReferences(id);
    if (orderCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete "${item.name}" because it is linked to ${orderCount} historical order(s). To remove it from the menu without corrupting order records, toggle its availability status to Unavailable.`
      );
    }

    return menuRepository.delete(id);
  }
};
