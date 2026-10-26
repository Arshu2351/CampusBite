// Order Routes
// Backend Concept: Modular Express Routers & HTTP methods

import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import {
  validateCreateOrder,
  validateUpdateOrderStatus
} from '../middleware/validateRequest.js';

const router = Router();

router.get('/', orderController.getOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);
router.post('/', validateCreateOrder, orderController.createOrder);
router.patch('/:id/status', validateUpdateOrderStatus, orderController.updateOrderStatus);

export default router;
