// Order Service Layer
// Advanced Database Concept: Database Transactions (ACID Compliance) & Data Integrity
// Backend Concept: Order Workflow State Machine & Server-side Total Calculation

import prisma from '../utils/prisma.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { ApiError } from '../utils/responseFormatter.js';
import { validateStatusTransition } from '../utils/statusTransitions.js';

export const orderService = {
  /**
   * Place an order within an atomic database transaction
   * Ensures all ACID properties:
   * - Atomicity: Either the order and all line items are created, or none are.
   * - Consistency: DB constraints, positive quantities, snapshot unit prices are enforced.
   * - Isolation: Concurrent queries will not see partial orders.
   * - Durability: Committed to PostgreSQL storage.
   */
  async placeOrder({ studentName, studentId, pickupTime, items }) {
    if (!items || items.length === 0) {
      throw new ApiError(400, 'Cannot place an empty order. Please select at least one item.');
    }

    // Execute within a single database transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Extract requested menu item IDs
      const itemIds = items.map(i => i.menuItemId);

      // 2. Fetch fresh items and prices directly from PostgreSQL
      const dbMenuItems = await tx.menuItem.findMany({
        where: { id: { in: itemIds } }
      });

      const dbItemMap = new Map(dbMenuItems.map(item => [item.id, item]));

      // 3. Verify that all requested items exist and are available
      let calculatedTotal = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const menuItem = dbItemMap.get(item.menuItemId);

        // Check existence
        if (!menuItem) {
          throw new ApiError(400, `Menu item with ID ${item.menuItemId} does not exist in the database.`);
        }

        // Check availability
        if (!menuItem.isAvailable) {
          throw new ApiError(400, `"${menuItem.name}" is currently sold out and unavailable for order.`);
        }

        // Validate quantity
        const quantity = parseInt(item.quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
          throw new ApiError(400, `Invalid quantity for "${menuItem.name}". Quantity must be at least 1.`);
        }

        // Server-side calculation using current database price (snapshot)
        const unitPriceNum = Number(menuItem.price);
        const lineTotal = unitPriceNum * quantity;
        calculatedTotal += lineTotal;

        orderItemsToCreate.push({
          menuItemId: menuItem.id,
          quantity: quantity,
          unitPrice: menuItem.price // Store exact Decimal snapshot
        });
      }

      // Round to 2 decimal places
      const finalTotal = Math.round(calculatedTotal * 100) / 100;

      // 4. Create the Order header record
      const createdOrder = await tx.order.create({
        data: {
          studentName,
          studentId,
          pickupTime,
          status: 'PLACED',
          totalAmount: finalTotal,
          orderItems: {
            create: orderItemsToCreate
          }
        },
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

      return createdOrder;
    });
  },

  /**
   * Fetch all orders with optional status filter
   */
  async getAllOrders(status) {
    const filter = status && status !== 'ALL' ? { status } : {};
    return orderRepository.findAll(filter);
  },

  /**
   * Fetch a single order by ID
   */
  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new ApiError(404, `Order with ID #${id} not found.`);
    }
    return order;
  },

  /**
   * Update order status with state machine transition checks
   */
  async updateOrderStatus(id, newStatus) {
    // 1. Check order existence
    const existingOrder = await this.getOrderById(id);

    // 2. Validate state machine transition
    const transitionCheck = validateStatusTransition(existingOrder.status, newStatus);
    if (!transitionCheck.valid) {
      throw new ApiError(400, transitionCheck.message);
    }

    // 3. Persist status update
    return orderRepository.updateStatus(id, newStatus);
  },

  /**
   * Fetch aggregate summary stats for staff dashboard
   */
  async getOrderStats() {
    return orderRepository.getSummaryStats();
  }
};
