const SECTION_COPY = {
  tech: {
    title: 'تقييم جلسات وسيشنات الشرح التقنية',
    titleSuffix: '(Technical Sessions)',
    subtitle: 'تقييم السيشنات والدراسة المقدمة من الانستراكتورز للطلاب هذا الشهر',
    addButton: 'إضافة سيشن تقنية',
    emptyPill: '0 سيشنات | لا توجد سيشنات مسجلة',
    countLabel: 'سيشنات',
    deleteTitle: 'حذف السيشن',
    notesLabel: 'تقييم وملاحظات الـ Supervisor على السيشن:',
  },
  non_tech: {
    title: 'ملخص اجتماعات اللجنة',
    titleSuffix: '(Team Meetings)',
    subtitle: 'سجل الحضور والغياب ومدة لقاءات أعضاء اللجنة خلال الشهر',
    addButton: 'إضافة اجتماع',
    emptyPill: '0 اجتماعات | لا توجد لقاءات مسجلة',
    countLabel: 'اجتماعات',
    deleteTitle: 'حذف الاجتماع',
    notesLabel: 'المواضيع والملاحظات:',
  },
};

const detailInputBase = 'bg-transparent focus:outline-none w-full';

export default function MeetingsSection({
  committeeType,
  meetings,
  isEditMode,
  attendanceRate,
  attendanceNotes,
  onAttendanceNotesChange,
  onAdd,
  onRemove,
  onUpdate,
}) {
  const copy = SECTION_COPY[committeeType] || SECTION_COPY.non_tech;
  const isTech = committeeType === 'tech';

  const pillText =
    meetings.length === 0
      ? copy.emptyPill
      : `${meetings.length} ${copy.countLabel} | متوسط الحضور ${attendanceRate}%`;

  return (
    <section className="glass-card print-card rounded-2xl p-6" id="meetings-section">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800 print-section-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gdg-blue/20 text-gdg-blue flex items-center justify-center font-bold">1</div>
          <div>
            <h2 className="text-lg font-bold text-white" id="meetings-section-title">
              {copy.title}{' '}
              <span className="text-xs text-slate-400 font-normal">{copy.titleSuffix}</span>
            </h2>
            <p className="text-xs text-slate-400" id="meetings-section-subtitle">
              {copy.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span id="meetings-summary-pill" className="text-xs px-3 py-1 bg-slate-800 rounded-full text-gdg-blue font-bold border border-slate-700 print-badge">
            {pillText}
          </span>
          {isEditMode && (
            <button
              onClick={onAdd}
              className="px-3 py-1 bg-gdg-blue/20 text-gdg-blue hover:bg-gdg-blue/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              <i className="fa-solid fa-plus"></i> <span id="add-meeting-btn-text">{copy.addButton}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Container for Meetings / Instructor Sessions Cards */}
      <div id="meetings-cards-container" className="space-y-4 mb-5">
        {meetings.length === 0 && (
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-dashed border-slate-700/80 text-center my-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2.5 shadow">
              <i className="fa-solid fa-calendar-xmark text-xl"></i>
            </div>
            <p className="text-sm font-bold text-slate-300">لا توجد لقاءات أو اجتماعات مسجلة لهذا الشهر</p>
            <p className="text-xs text-slate-500 mt-1">
              يمكنك إضافة اجتماع جديد بالضغط على زر "إضافة اجتماع" في الأعلى بعد تفعيل وضع التعديل.
            </p>
          </div>
        )}

        {meetings.map((m, idx) => (
          <div key={m.id ?? idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 relative group">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800">
              {isEditMode ? (
                <input
                  type="text"
                  value={m.title}
                  onChange={(e) => onUpdate(idx, 'title', e.target.value)}
                  className={`font-bold text-sm ${isTech ? 'text-gdg-blue' : 'text-slate-100'} bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gdg-blue flex-1 min-w-[200px]`}
                />
              ) : (
                <h3 className={`font-bold text-sm ${isTech ? 'text-gdg-blue' : 'text-slate-100'} flex-1 leading-relaxed`}>
                  {m.title}
                </h3>
              )}
              <div className="flex items-center gap-2 shrink-0">
                {isTech &&
                  (isEditMode ? (
                    <select
                      value={m.type || 'أونلاين (Google Meet)'}
                      onChange={(e) => onUpdate(idx, 'type', e.target.value)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-bold focus:outline-none focus:border-gdg-blue"
                    >
                      <option value="أونلاين (Google Meet)">أونلاين (Google Meet)</option>
                      <option value="أوفلاين (حضوري)">أوفلاين (حضوري)</option>
                    </select>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 print-badge">
                      {m.type}
                    </span>
                  ))}
                {isEditMode && (
                  <button
                    onClick={() => onRemove(idx)}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg border border-red-500/20 bg-red-500/10 no-print flex items-center gap-1 transition shrink-0"
                    title={copy.deleteTitle}
                  >
                    <i className="fa-solid fa-trash"></i> <span>حذف</span>
                  </button>
                )}
              </div>
            </div>

            <div className={`grid ${isTech ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-3 text-xs`}>
              {isTech && (
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">اسم الانستراكتور:</span>
                  <input
                    type="text"
                    value={m.instructor || ''}
                    readOnly={!isEditMode}
                    onChange={(e) => onUpdate(idx, 'instructor', e.target.value)}
                    className={`font-semibold text-white ${detailInputBase}`}
                  />
                </div>
              )}
              <div className="bg-slate-800/50 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">مدة السيشن:</span>
                <input
                  type="text"
                  value={m.duration}
                  readOnly={!isEditMode}
                  onChange={(e) => onUpdate(idx, 'duration', e.target.value)}
                  className={`font-semibold text-white ${detailInputBase}`}
                />
              </div>
              <div className="bg-slate-800/50 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">عدد الحضور:</span>
                <input
                  type="number"
                  value={m.attendance}
                  readOnly={!isEditMode}
                  onChange={(e) => onUpdate(idx, 'attendance', parseInt(e.target.value) || 0)}
                  className={`font-bold text-emerald-400 ${detailInputBase}`}
                />
              </div>
              <div className="bg-slate-800/50 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">عدد الغياب:</span>
                <input
                  type="number"
                  value={m.absence}
                  readOnly={!isEditMode}
                  onChange={(e) => onUpdate(idx, 'absence', parseInt(e.target.value) || 0)}
                  className={`font-bold text-gdg-red ${detailInputBase}`}
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">{copy.notesLabel}</span>
              <input
                type="text"
                value={m.notes}
                readOnly={!isEditMode}
                onChange={(e) => onUpdate(idx, 'notes', e.target.value)}
                className="w-full text-xs text-slate-300 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Attendance General Status Notes */}
      <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800">
        <label className="block text-xs font-semibold text-slate-400 mb-2">
          ملاحظات عامة حول التزام الحضور والغياب (خاص بـ Supervisor)
        </label>
        <textarea
          id="attendance-notes"
          rows="2"
          value={attendanceNotes}
          readOnly={!isEditMode}
          onChange={(e) => onAttendanceNotesChange(e.target.value)}
          className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-gdg-blue transition read-only:bg-transparent read-only:border-none read-only:p-0"
        ></textarea>
      </div>
    </section>
  );
}
