// Menu API Service
// Full Stack Concept: Frontend Service Layer abstraction

import api from './api';

export const menuService = {
  /**
   * Fetch all menu items
   * @param {boolean} availableOnly - optionally filter by availability
   */
  async getAll(availableOnly = false) {
    const res = await api.get('/menu', {
      params: availableOnly ? { available: 'true' } : {}
    });
    return res.data;
  },

  /**
   * Fetch single menu item by ID
   */
  async getById(id) {
    const res = await api.get(`/menu/${id}`);
    return res.data;
  },

  /**
   * Create new menu item
   */
  async create(data) {
    const res = await api.post('/menu', data);
    return res.data;
  },

  /**
   * Update existing menu item
   */
  async update(id, data) {
    const res = await api.put(`/menu/${id}`, data);
    return res.data;
  },

  /**
   * Delete menu item
   */
  async delete(id) {
    const res = await api.delete(`/menu/${id}`);
    return res.data;
  }
};
