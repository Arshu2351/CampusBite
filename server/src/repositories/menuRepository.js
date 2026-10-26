// Menu Repository
// Advanced Database Concept: Data Access Layer & Prisma ORM Queries

import prisma from '../utils/prisma.js';

export const menuRepository = {
  /**
   * Fetch all menu items with optional availability filter
   */
  async findAll(filter = {}) {
    return prisma.menuItem.findMany({
      where: filter,
      orderBy: { id: 'asc' }
    });
  },

  /**
   * Fetch a single menu item by primary key
   */
  async findById(id) {
    return prisma.menuItem.findUnique({
      where: { id }
    });
  },

  /**
   * Fetch multiple menu items by array of IDs (used in order validation)
   */
  async findManyByIds(ids) {
    return prisma.menuItem.findMany({
      where: {
        id: { in: ids }
      }
    });
  },

  /**
   * Count occurrences of menuItem in order items (foreign key check)
   */
  async countOrderReferences(menuItemId) {
    return prisma.orderItem.count({
      where: { menuItemId }
    });
  },

  /**
   * Insert a new menu item
   */
  async create(data) {
    return prisma.menuItem.create({
      data
    });
  },

  /**
   * Update an existing menu item
   */
  async update(id, data) {
    return prisma.menuItem.update({
      where: { id },
      data
    });
  },

  /**
   * Delete a menu item by ID
   */
  async delete(id) {
    return prisma.menuItem.delete({
      where: { id }
    });
  }
};
