import Evaluation from '../models/Evaluation.js';
import { computeEvaluationScore } from '../utils/score.js';
import { COMMITTEE_BY_ID, getCommitteeInfo } from '../data/committees.js';

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
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const clampScore = (value, fallback) => {
  const n = toNumber(value, fallback);
  return Math.min(100, Math.max(0, n));
};

const clampAttendanceCount = (value) => Math.min(100000, Math.max(0, toNumber(value)));

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
    // The server owns persistence timestamps; do not accept client clock values.
    savedAt: new Date(),
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
            meeting[field] = clampAttendanceCount(m[field]);
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

    if (req.user.role === 'supervisor') {
      if (!COMMITTEE_BY_ID.has(req.user.committee)) {
        return res.status(403).json({ message: 'A committee assignment is required' });
      }
      if (filter.committeeId && filter.committeeId !== req.user.committee) {
        return res.status(403).json({ message: 'You can only access your assigned committee' });
      }
      filter.committeeId = req.user.committee;
    }

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
    if (req.user.role === 'supervisor' && (!COMMITTEE_BY_ID.has(req.user.committee) || evaluation.committeeId !== req.user.committee)) {
      return res.status(403).json({ message: 'You can only access your assigned committee' });
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
    if (data.month.length > 40) {
      return res.status(400).json({ message: 'Month is too long' });
    }
    const committee = COMMITTEE_BY_ID.get(data.committeeId);
    if (!committee || committee.type !== data.committeeType) {
      return res.status(400).json({ message: 'Unknown committee or committee type mismatch' });
    }

    if (req.user.role === 'supervisor') {
      if (!COMMITTEE_BY_ID.has(req.user.committee) || data.committeeId !== req.user.committee) {
        return res.status(403).json({ message: 'You can only create evaluations for your assigned committee' });
      }
    }

    // The authenticated database user is the source of creator identity.
    // Keep the existing field for compatibility with historical reports.
    data.supervisor = req.user.name;

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

    if (req.user.role === 'supervisor' && (!COMMITTEE_BY_ID.has(req.user.committee) || evaluation.committeeId !== req.user.committee)) {
      return res.status(403).json({ message: 'You can only update your assigned committee' });
    }

    const data = sanitizeEvaluation(req.body);
    // Creator is immutable on update; this preserves historical creator names.
    data.supervisor = evaluation.supervisor;
    data.committeeId = evaluation.committeeId;
    data.month = evaluation.month;
    data.committeeType = evaluation.committeeType;
    if (req.user.role === 'supervisor') data.supervisor = req.user.name;
    evaluation.set(data);
    await evaluation.save();

    res.json({ evaluation });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/evaluations/:id
export async function deleteEvaluation(req, res, next) {
  try {
    if (req.user?.role === 'supervisor') {
      return res.status(403).json({ message: 'Supervisors cannot delete evaluations' });
    }
    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.json({ message: 'Evaluation deleted' });
  } catch (error) {
    next(error);
  }
}

// GET /api/evaluations/months
export async function getEvaluationMonths(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'supervisor') {
      if (!COMMITTEE_BY_ID.has(req.user.committee)) {
        return res.status(403).json({ message: 'A committee assignment is required' });
      }
      filter.committeeId = req.user.committee;
    }
    const months = await Evaluation.distinct('month', filter);
    res.json({ months: months.filter((month) => typeof month === 'string').sort() });
  } catch (error) {
    next(error);
  }
}

// GET /api/leaderboard?month=...&type=tech|non_tech
export async function getLeaderboard(req, res, next) {
  try {
    if (!['head_hr', 'leaderboard_viewer'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden: ranking access is restricted' });
    }
    const month = typeof req.query.month === 'string' ? req.query.month.trim() : '';
    if (!month) return res.status(400).json({ message: 'Month is required' });
    if (month.length > 40) return res.status(400).json({ message: 'Month is too long' });
    if (req.query.type && !['tech', 'non_tech'].includes(req.query.type)) {
      return res.status(400).json({ message: 'Type must be tech or non_tech' });
    }

    const filter = {};
    if (month) filter.month = month;
    if (req.query.type) filter.committeeType = req.query.type;

    if (req.user.role === 'supervisor') {
      if (!COMMITTEE_BY_ID.has(req.user.committee)) {
        return res.status(403).json({ message: 'A committee assignment is required' });
      }
      filter.committeeId = req.user.committee;
    }

    const evaluations = await Evaluation.find(filter)
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    const rankings = evaluations.map((evaluation) => {
      const { attendanceRate, overallScore } = computeEvaluationScore(evaluation);
      const committee = getCommitteeInfo(evaluation.committeeId, evaluation.committeeType);
      const tasks = evaluation.tasks || [];
      return {
        id: String(evaluation._id),
        month: evaluation.month,
        committeeId: evaluation.committeeId,
        committeeName: committee.name,
        committeeType: evaluation.committeeType,
        supervisor: evaluation.supervisor || '',
        attendanceRate,
        commScore: Number(evaluation.commScore) || 0,
        deadlineScore: Number(evaluation.deadlineScore) || 0,
        overallScore,
        totalMeetings: (evaluation.meetings || []).length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((task) => task.status === 'completed').length,
        bestMember: evaluation.bestMember || '',
        warnings: evaluation.warnings || '',
        filteration: evaluation.filteration || '',
      };
    });

    rankings.sort((a, b) =>
      b.overallScore - a.overallScore ||
      b.deadlineScore - a.deadlineScore ||
      b.attendanceRate - a.attendanceRate ||
      b.commScore - a.commScore ||
      a.committeeName.localeCompare(b.committeeName)
    );
    rankings.forEach((item, index) => { item.rank = index + 1; });

    const count = rankings.length;
    const average = (field) => count
      ? Math.round(rankings.reduce((total, item) => total + item[field], 0) / count)
      : 0;
    const needsAttention = [...rankings]
      .sort((a, b) => a.overallScore - b.overallScore)
      .slice(0, 3)
      .map((item) => ({
        ...item,
        issues: [
          ...(item.attendanceRate < 90 ? [`الحضور أقل من 90% (${item.attendanceRate}%)`] : []),
          ...(item.deadlineScore < 88 ? [`إنجاز المهام أقل من 88% (${item.deadlineScore}%)`] : []),
          ...(item.commScore < 90 ? [`التواصل أقل من 90% (${item.commScore}%)`] : []),
        ],
      }));

    res.json({
      month,
      type: req.query.type || 'all',
      summary: {
        totalCommittees: count,
        avgOverallScore: average('overallScore'),
        avgAttendance: average('attendanceRate'),
        avgDeadline: average('deadlineScore'),
        totalMeetings: rankings.reduce((total, item) => total + item.totalMeetings, 0),
      },
      podium: rankings.slice(0, 3),
      rankings,
      insights: {
        bestMembers: rankings.filter((item) => item.bestMember.trim()),
        needsAttention,
        warnings: rankings.filter((item) => item.warnings.trim()),
        filtering: rankings.filter((item) => item.filteration.trim()),
      },
      distribution: {
        excellent: rankings.filter((item) => item.overallScore >= 90).length,
        veryGood: rankings.filter((item) => item.overallScore >= 80 && item.overallScore < 90).length,
        good: rankings.filter((item) => item.overallScore >= 70 && item.overallScore < 80).length,
        needsAttention: rankings.filter((item) => item.overallScore < 70).length,
      },
    });
  } catch (error) {
    next(error);
  }
}
