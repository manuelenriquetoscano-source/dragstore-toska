import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, updateProfile, getUsers, refresh, logout } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: { code: 'TOO_MANY_ATTEMPTS', message: 'Demasiados intentos. Probá de nuevo en 15 minutos.' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
router.post('/register', authenticate, authorize('admin'), register);
router.post('/refresh', authenticate, refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.get('/users', authenticate, authorize('admin'), getUsers);

export default router;
