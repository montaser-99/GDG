// Scoring formula and status mappings (ported unchanged from the original)

export function computeAttendanceRate(meetings) {
  let totalAttendance = 0;
  let totalAbsence = 0;

  meetings.forEach((m) => {
    totalAttendance += parseInt(m.attendance) || 0;
    totalAbsence += parseInt(m.absence) || 0;
  });

  const totalPeople = totalAttendance + totalAbsence;
  return totalPeople > 0 ? Math.round((totalAttendance / totalPeople) * 100) : 100;
}

// Overall Score = attendance * 0.30 + communication * 0.35 + deadlines * 0.35
export function computeScore(attendanceRate, commScore, deadlineScore) {
  return Math.round(attendanceRate * 0.3 + commScore * 0.35 + deadlineScore * 0.35);
}

const BADGE_BASE =
  'inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full border print-badge';

export function getScoreBadge(score) {
  if (score >= 90) {
    return {
      text: 'ممتاز مرتفع',
      className: `${BADGE_BASE} bg-emerald-500/20 text-emerald-400 border-emerald-500/30`,
    };
  }
  if (score >= 80) {
    return {
      text: 'جيد جداً مرتفع',
      className: `${BADGE_BASE} bg-emerald-500/20 text-emerald-400 border-emerald-500/30`,
    };
  }
  if (score >= 70) {
    return {
      text: 'جيد',
      className: `${BADGE_BASE} bg-gdg-yellow/20 text-gdg-yellow border-gdg-yellow/30`,
    };
  }
  return {
    text: 'يحتاج لمتابعة',
    className: `${BADGE_BASE} bg-gdg-red/20 text-gdg-red border-gdg-red/30`,
  };
}

export const statusMap = {
  completed: { label: 'مكتملة ✅', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  in_progress: { label: 'قيد التنفيذ ⏳', class: 'text-gdg-blue bg-gdg-blue/10 border-gdg-blue/20' },
  delayed: { label: 'متأخرة ⚠️', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};
