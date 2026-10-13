import mongoose from 'mongoose';

// Meetings support both current shapes:
//   non-tech: { title, duration, attendance, absence, notes }
//   tech:     { title, duration, attendance, absence, notes, instructor, type }
const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    duration: { type: String, trim: true, default: '' },
    attendance: { type: Number, default: 0 },
    absence: { type: Number, default: 0 },
    notes: { type: String, trim: true, default: '' },
    instructor: { type: String, trim: true },
    type: { type: String, trim: true },
  },
  { _id: false }
);

const TASK_STATUSES = ['completed', 'in_progress', 'delayed'];

const taskSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, required: true },
    assignee: { type: String, trim: true, default: '' },
    status: { type: String, enum: TASK_STATUSES, default: 'completed' },
  },
  { _id: false }
);

const evaluationSchema = new mongoose.Schema(
  {
    // Arabic display value kept temporarily; Phase 3 will map frontend values.
    month: { type: String, required: [true, 'Month is required'], trim: true },

    committeeId: { type: String, required: [true, 'Committee id is required'], trim: true },
    committeeType: { type: String, enum: ['tech', 'non_tech'], required: true },

    supervisor: { type: String, trim: true, default: '' },
    target: { type: String, trim: true, default: '' },

    commScore: { type: Number, default: 90 },
    deadlineScore: { type: Number, default: 85 },

    // Recalculated server-side on every save (same formula as the frontend).
    attendanceRate: { type: Number, default: 100 },
    overallScore: { type: Number, default: 0 },

    attendanceNotes: { type: String, trim: true, default: '' },
    challenges: { type: String, trim: true, default: '' },
    solutions: { type: String, trim: true, default: '' },
    deliverables: { type: String, trim: true, default: '' },

    warnings: { type: String, trim: true, default: '' },
    filteration: { type: String, trim: true, default: '' },
    bestMember: { type: String, trim: true, default: '' },
    generalRecs: { type: String, trim: true, default: '' },

    meetings: { type: [meetingSchema], default: [] },
    tasks: { type: [taskSchema], default: [] },

    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One evaluation per committee per month.
evaluationSchema.index({ committeeId: 1, month: 1 }, { unique: true });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

export default Evaluation;
