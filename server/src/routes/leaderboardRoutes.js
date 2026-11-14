import { Router } from 'express';
import { getLeaderboard } from '../controllers/evaluationController.js';
import { authorize, protect, requirePasswordChangeComplete } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, requirePasswordChangeComplete, authorize('head_hr', 'leaderboard_viewer'), getLeaderboard);

export default router;
