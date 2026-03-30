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

router.use(authenticate);
router.get('/', getProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/:id', getProduct);
router.post('/', authorize('admin', 'stock'), createProduct);
router.put('/:id', authorize('admin', 'stock'), updateProduct);
router.put('/:id/stock', authorize('admin', 'stock'), updateStock);
router.delete('/:id', authorize('admin'), deleteProduct);

export default router;
