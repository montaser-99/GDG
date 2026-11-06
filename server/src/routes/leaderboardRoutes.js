import { Router } from 'express';
import { getLeaderboard } from '../controllers/evaluationController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, authorize('head_hr', 'supervisor'), getLeaderboard);

export default router;
