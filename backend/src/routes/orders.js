import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  getTodaySales
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getOrders);
router.get('/today', authenticate, getTodaySales);
router.get('/:id', authenticate, getOrder);
router.post('/', authenticate, createOrder);
router.put('/:id/cancel', authenticate, authorize('admin', 'cashier'), cancelOrder);

export default router;
