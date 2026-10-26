// Menu Routes
// Backend Concept: Modular Express Routers & HTTP methods

import { Router } from 'express';
import { menuController } from '../controllers/menuController.js';
import {
  validateCreateMenuItem,
  validateUpdateMenuItem
} from '../middleware/validateRequest.js';

const router = Router();

router.get('/', menuController.getMenuItems);
router.get('/:id', menuController.getMenuItemById);
router.post('/', validateCreateMenuItem, menuController.createMenuItem);
router.put('/:id', validateUpdateMenuItem, menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);

export default router;
