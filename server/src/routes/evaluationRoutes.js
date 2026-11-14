import { Router } from 'express';
import {
  clearMonthEvaluations,
  createEvaluation,
  deleteEvaluation,
  getEvaluation,
  getEvaluationMonths,
  getEvaluations,
  resetAllEvaluations,
  updateEvaluation,
} from '../controllers/evaluationController.js';
import { authorize, protect, requirePasswordChangeComplete } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, requirePasswordChangeComplete, authorize('head_hr', 'leaderboard_viewer', 'supervisor'));

router.route('/').get(getEvaluations).post(authorize('head_hr', 'supervisor'), createEvaluation);
router.get('/months', getEvaluationMonths);
router.delete('/clear-month/:month', authorize('head_hr'), clearMonthEvaluations);
router.delete('/reset-all', authorize('head_hr'), resetAllEvaluations);
router.route('/:id').get(getEvaluation).put(authorize('head_hr', 'supervisor'), updateEvaluation);
router.delete('/:id', authorize('head_hr'), deleteEvaluation);

export default router;
