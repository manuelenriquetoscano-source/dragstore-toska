import { Router } from 'express';
import { getStats, getSalesByPeriod, getTopProducts, getInventoryValue } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, getStats);
router.get('/sales', authenticate, getSalesByPeriod);
router.get('/top-products', authenticate, getTopProducts);
router.get('/inventory-value', authenticate, getInventoryValue);

export default router;
