import { Router } from 'express';
import { changePassword, getMe, login, logout, register } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', rateLimit({ limit: 10, windowMs: 15 * 60 * 1000 }), register);
router.post('/login', rateLimit({ limit: 10, windowMs: 15 * 60 * 1000 }), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/password', protect, rateLimit({ limit: 10, windowMs: 15 * 60 * 1000 }), changePassword);

export default router;
