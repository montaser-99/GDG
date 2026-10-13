export default function KpiCards({ score, scoreBadge, attendanceRate, meetingsCount, deadlineScore }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Card 1: Dynamic Score */}
      <div className="glass-card print-card rounded-2xl p-5 border-l-4 border-l-gdg-blue relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">التقييم الشامل للجنة</p>
            <h3 className="text-3xl font-extrabold text-white mt-2" id="kpi-score-display">
              {score} / 100
            </h3>
            <span className={scoreBadge.className} id="kpi-status-badge">
              {scoreBadge.text}
            </span>
          </div>
          <div className="p-3 bg-gdg-blue/10 text-gdg-blue rounded-xl no-print">
            <i className="fa-solid fa-trophy text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Card 2: Auto Aggregated Attendance */}
      <div className="glass-card print-card rounded-2xl p-5 border-l-4 border-l-gdg-green relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">نسبة التزام الحضور</p>
            <h3 className="text-3xl font-extrabold text-white mt-2" id="kpi-attendance-display">
              {attendanceRate}%
            </h3>
            <p className="text-xs text-slate-400 mt-2" id="kpi-attendance-subtitle">
              {meetingsCount === 0 ? 'لا توجد لقاءات هذا الشهر' : 'محسوبة تلقائياً من اللقاءات'}
            </p>
          </div>
          <div className="p-3 bg-gdg-green/10 text-gdg-green rounded-xl no-print">
            <i className="fa-solid fa-users-rectangle text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Card 3: Total Task Execution */}
      <div className="glass-card print-card rounded-2xl p-5 border-l-4 border-l-gdg-yellow relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">نسبة إنجاز المهام</p>
            <h3 className="text-3xl font-extrabold text-white mt-2" id="kpi-tasks-display">
              {deadlineScore}%
            </h3>
            <p className="text-xs text-slate-400 mt-2">معدل الانضباط والتسليم</p>
          </div>
          <div className="p-3 bg-gdg-yellow/10 text-gdg-yellow rounded-xl no-print">
            <i className="fa-solid fa-list-check text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Card 4: Monthly Deliverables */}
      <div className="glass-card print-card rounded-2xl p-5 border-l-4 border-l-gdg-red relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">مخرجات وإنجازات الشهر</p>
            <h3 className="text-2xl font-extrabold text-white mt-2" id="kpi-readiness-display">
              مكتملة 100%
            </h3>
            <p className="text-xs text-slate-400 mt-2">استيفاء المخرجات المستهدفة</p>
          </div>
          <div className="p-3 bg-gdg-red/10 text-gdg-red rounded-xl no-print">
            <i className="fa-solid fa-box-archive text-2xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
