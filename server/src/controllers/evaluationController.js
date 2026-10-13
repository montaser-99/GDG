import Evaluation from '../models/Evaluation.js';
import { computeEvaluationScore } from '../utils/score.js';

const TEXT_FIELDS = [
  'supervisor',
  'target',
  'attendanceNotes',
  'challenges',
  'solutions',
  'deliverables',
  'warnings',
  'filteration',
  'bestMember',
  'generalRecs',
];

const MEETING_FIELDS = ['title', 'duration', 'attendance', 'absence', 'notes', 'instructor', 'type'];
const TASK_STATUSES = ['completed', 'in_progress', 'delayed'];

const toNumber = (value, fallback = 0) => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
};

const clampScore = (value, fallback) => {
  const n = toNumber(value, fallback);
  return Math.min(100, Math.max(0, n));
};

// Keeps only known fields, coerces types, accepts the frontend's task field
// name (`assigned`) and normalizes it to the schema's `assignee`, then
// recalculates the score exactly like the frontend formula.
function sanitizeEvaluation(body = {}) {
  const data = {
    month: typeof body.month === 'string' ? body.month.trim() : '',
    committeeId: typeof body.committeeId === 'string' ? body.committeeId.trim() : '',
    committeeType: body.committeeType === 'tech' ? 'tech' : 'non_tech',
    commScore: clampScore(body.commScore, 90),
    deadlineScore: clampScore(body.deadlineScore, 85),
    meetings: [],
    tasks: [],
    savedAt: body.savedAt ? new Date(body.savedAt) : new Date(),
  };

  for (const field of TEXT_FIELDS) {
    data[field] = typeof body[field] === 'string' ? body[field] : '';
  }

  if (Array.isArray(body.meetings)) {
    data.meetings = body.meetings
      .filter((m) => m && typeof m === 'object')
      .map((m) => {
        const meeting = {};
        for (const field of MEETING_FIELDS) {
          if (field === 'attendance' || field === 'absence') {
            meeting[field] = toNumber(m[field], 0);
          } else if (m[field] !== undefined) {
            meeting[field] = String(m[field]);
          }
        }
        return meeting;
      });
  }

  if (Array.isArray(body.tasks)) {
    data.tasks = body.tasks
      .filter((t) => t && typeof t.text === 'string' && t.text.trim())
      .map((t) => ({
        text: t.text,
        assignee: typeof (t.assignee ?? t.assigned) === 'string' ? (t.assignee ?? t.assigned) : '',
        status: TASK_STATUSES.includes(t.status) ? t.status : 'completed',
      }));
  }

  const score = computeEvaluationScore(data);
  data.attendanceRate = score.attendanceRate;
  data.overallScore = score.overallScore;

  return data;
}

// GET /api/evaluations?committeeId=...&month=...
export async function getEvaluations(req, res, next) {
  try {
    const filter = {};
    if (req.query.committeeId) filter.committeeId = String(req.query.committeeId);
    if (req.query.month) filter.month = String(req.query.month);

    const evaluations = await Evaluation.find(filter).sort({ updatedAt: -1 }).limit(100);
    res.json({ evaluations });
  } catch (error) {
    next(error);
  }
}

// GET /api/evaluations/:id
export async function getEvaluation(req, res, next) {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.json({ evaluation });
  } catch (error) {
    next(error);
  }
}

// POST /api/evaluations
export async function createEvaluation(req, res, next) {
  try {
    const data = sanitizeEvaluation(req.body);
    if (!data.month || !data.committeeId) {
      return res.status(400).json({ message: 'month and committeeId are required' });
    }

    const evaluation = await Evaluation.create(data);
    res.status(201).json({ evaluation });
  } catch (error) {
    next(error);
  }
}

// PUT /api/evaluations/:id
export async function updateEvaluation(req, res, next) {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    evaluation.set(sanitizeEvaluation(req.body));
    await evaluation.save();

    res.json({ evaluation });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/evaluations/:id
export async function deleteEvaluation(req, res, next) {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.json({ message: 'Evaluation deleted' });
  } catch (error) {
    next(error);
  }
}
