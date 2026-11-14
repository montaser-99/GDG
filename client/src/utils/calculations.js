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
  'inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full border print-badge';

export function getScoreBadge(score) {
  const numericScore = Number(score) || 0;

  if (numericScore >= 90) {
    return {
      text: 'ممتاز مرتفع',
      className: `${BADGE_BASE} bg-emerald-500/20 text-emerald-400 border-emerald-500/30`,
      badgeClass: 'rating-badge rating-badge-excellent',
      tone: 'tone-green',
      description: 'أداء متميز وتفاعل استثنائي',
    };
  }
  if (numericScore >= 80) {
    return {
      text: 'ممتاز',
      className: `${BADGE_BASE} bg-teal-500/20 text-teal-400 border-teal-500/30`,
      badgeClass: 'rating-badge rating-badge-great',
      tone: 'tone-green',
      description: 'التزام عالي ومخرجات منتظمة',
    };
  }
  if (numericScore >= 70) {
    return {
      text: 'جيد جداً',
      className: `${BADGE_BASE} bg-blue-500/20 text-blue-400 border-blue-500/30`,
      badgeClass: 'rating-badge rating-badge-very-good',
      tone: 'tone-blue',
      description: 'أداء مستقر مع التزام جيد',
    };
  }
  if (numericScore >= 60) {
    return {
      text: 'جيد',
      className: `${BADGE_BASE} bg-amber-500/20 text-amber-400 border-amber-500/30`,
      badgeClass: 'rating-badge rating-badge-good',
      tone: 'tone-yellow',
      description: 'يحتاج تحسين بعض النقاط',
    };
  }
  return {
    text: 'يحتاج للمتابعة',
    className: `${BADGE_BASE} bg-rose-500/20 text-rose-400 border-rose-500/30`,
    badgeClass: 'rating-badge rating-badge-attention',
    tone: 'tone-red',
    description: 'يتطلب مراجعة من المشرف والـ HR',
  };
}

export const statusMap = {
  completed: { label: 'مكتملة ✅', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  in_progress: { label: 'قيد التنفيذ ⏳', class: 'text-gdg-blue bg-gdg-blue/10 border-gdg-blue/20' },
  delayed: { label: 'متأخرة ⚠️', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};
