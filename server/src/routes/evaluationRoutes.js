import { Router } from 'express';
import {
  createEvaluation,
  deleteEvaluation,
  getEvaluation,
  getEvaluationMonths,
  getEvaluations,
  updateEvaluation,
} from '../controllers/evaluationController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, authorize('head_hr', 'supervisor'));

router.route('/').get(getEvaluations).post(createEvaluation);
router.get('/months', getEvaluationMonths);
router.route('/:id').get(getEvaluation).put(updateEvaluation);
router.delete('/:id', authorize('head_hr'), deleteEvaluation);

export default router;
