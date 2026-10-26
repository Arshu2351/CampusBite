// Order API Service
// Full Stack Concept: Frontend Service Layer abstraction

import api from './api';

export const orderService = {
  /**
   * Fetch all orders with optional status filter
   */
  async getAll(status) {
    const res = await api.get('/orders', {
      params: status && status !== 'ALL' ? { status } : {}
    });
    return res.data;
  },

  /**
   * Fetch summary statistics for staff dashboard
   */
  async getStats() {
    const res = await api.get('/orders/stats');
    return res.data;
  },

  /**
   * Fetch a single order by ID
   */
  async getById(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  /**
   * Submit a new student order
   */
  async create(orderData) {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  /**
   * Update order status
   */
  async updateStatus(id, status) {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data;
  }
};
