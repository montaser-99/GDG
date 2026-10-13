import { Router } from 'express';
import {
  createEvaluation,
  deleteEvaluation,
  getEvaluation,
  getEvaluations,
  updateEvaluation,
} from '../controllers/evaluationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All evaluation routes require authentication once Phase 3 wires the client.
router.use(protect);

router.route('/').get(getEvaluations).post(createEvaluation);
router.route('/:id').get(getEvaluation).put(updateEvaluation).delete(deleteEvaluation);

export default router;
