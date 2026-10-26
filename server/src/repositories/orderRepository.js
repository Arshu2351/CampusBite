// Order Repository
// Advanced Database Concept: Relational queries with joins (Prisma include)

import prisma from '../utils/prisma.js';

export const orderRepository = {
  /**
   * Fetch all orders with optional status filter and full item details
   */
  async findAll(filter = {}) {
    return prisma.order.findMany({
      where: filter,
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Fetch a single order by ID with line items
   */
  async findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      }
    });
  },

  /**
   * Update order status
   */
  async updateStatus(id, status) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      }
    });
  },

  /**
   * Aggregate statistics for staff dashboard
   */
  async getSummaryStats() {
    const [total, placed, preparing, ready, collected, cancelled] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PLACED' } }),
      prisma.order.count({ where: { status: 'PREPARING' } }),
      prisma.order.count({ where: { status: 'READY' } }),
      prisma.order.count({ where: { status: 'COLLECTED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } })
    ]);

    const pending = placed + preparing;

    return {
      total,
      pending,
      placed,
      preparing,
      ready,
      collected,
      cancelled
    };
  }
};
