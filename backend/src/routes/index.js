import { Router } from 'express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import orderRoutes from './orders.js';
import dashboardRoutes from './dashboard.js';
import categoryRoutes from './categories.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/categories', categoryRoutes);

export default router;
