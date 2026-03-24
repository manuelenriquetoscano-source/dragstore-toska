import { Router } from 'express';
import {
  getProducts,
  getProduct,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/:id', getProduct);
router.post('/', authenticate, authorize('admin', 'stock'), createProduct);
router.put('/:id', authenticate, authorize('admin', 'stock'), updateProduct);
router.put('/:id/stock', authenticate, authorize('admin', 'stock'), updateStock);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
