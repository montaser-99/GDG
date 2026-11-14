import { Router } from 'express';
import { authorize, protect, requirePasswordChangeComplete } from '../middleware/authMiddleware.js';
import { createUser, getUser, listUsers, resetUserPassword, updateUser } from '../controllers/adminController.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.use(protect, requirePasswordChangeComplete, authorize('head_hr'), rateLimit({ limit: 60, windowMs: 15 * 60 * 1000 }));
router.route('/users').get(listUsers).post(createUser);
router.route('/users/:id').get(getUser).patch(updateUser);
router.post('/users/:id/reset-password', resetUserPassword);

export default router;
