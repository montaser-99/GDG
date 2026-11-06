export default function KpiCards({ score, scoreBadge, attendanceRate, meetingsCount, deadlineScore, deliverables }) {
  const deliverablesRegistered = Boolean(deliverables?.trim());

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8" aria-label="ملخص أداء اللجنة">
      <article className="glass-card print-card rounded-2xl p-5 border-l-4 border-l-gdg-blue">
        <p className="text-xs font-bold text-slate-400">التقييم الشامل</p>
        <h2 className="text-3xl font-extrabold text-white mt-2" id="kpi-score-display">{score} / 100</h2>
        <span className={scoreBadge.className} id="kpi-status-badge">{scoreBadge.text}</span>
      </article>

      <article className="glass-card print-card rounded-2xl p-5 border-l-4 border-l-gdg-green">
        <p className="text-xs font-bold text-slate-400">الحضور</p>
        <h2 className="text-3xl font-extrabold text-white mt-2" id="kpi-attendance-display">{meetingsCount > 0 ? `${attendanceRate}%` : '—'}</h2>
        <p className="text-xs text-slate-400 mt-2" id="kpi-attendance-subtitle">
          {meetingsCount === 0 ? 'لا توجد اجتماعات مسجلة' : `محسوب من ${meetingsCount} اجتماعات`}
        </p>
      </article>

      <article className="glass-card print-card rounded-2xl p-5 border-l-4 border-l-gdg-yellow">
        <p className="text-xs font-bold text-slate-400">الالتزام بالمواعيد</p>
        <h2 className="text-3xl font-extrabold text-white mt-2" id="kpi-tasks-display">{deadlineScore}%</h2>
        <p className="text-xs text-slate-400 mt-2">مؤشر الالتزام بالمواعيد</p>
      </article>

      <article className="glass-card print-card rounded-2xl p-5 border-l-4 border-l-gdg-red">
        <p className="text-xs font-bold text-slate-400">مخرجات الشهر</p>
        <h2 className="text-xl font-extrabold text-white mt-2" id="kpi-readiness-display">
          {deliverablesRegistered ? 'تم تسجيلها' : 'لم تُسجل بعد'}
        </h2>
        <p className="text-xs text-slate-400 mt-2">الحالة حسب التقرير المحفوظ</p>
      </article>
    </section>
  );
}
