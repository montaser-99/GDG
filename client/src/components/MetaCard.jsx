import { committeesData, MONTHS } from '../data/committees';

// Read-only/edit styling mirrors the original toggleEditMode behavior:
// inputs carry read-only: variants and the readonly attribute is flipped.
const supervisorTargetClass =
  'w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-gdg-blue transition read-only:bg-transparent read-only:border-none read-only:p-0 read-only:text-slate-200';

const targetClass = supervisorTargetClass.replace('font-bold', 'font-semibold');

const selectClass =
  'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-bold text-sm focus:outline-none focus:border-gdg-blue transition';

const committeeSelectClass = selectClass.replace('text-slate-200', 'text-white');

export default function MetaCard({
  committeeType,
  committeeId,
  month,
  supervisor,
  target,
  isEditMode,
  onTypeChange,
  onCommitteeChange,
  onMonthChange,
  onSupervisorChange,
  onTargetChange,
}) {
  return (
    /* Meta Information Header Card */
    <div className="glass-card print-card rounded-2xl p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-gdg-blue via-gdg-red via-gdg-yellow to-gdg-green"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Committee Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">تصنيف اللجنة</label>
          <select
            id="meta-committee-type"
            value={committeeType}
            onChange={(e) => onTypeChange(e.target.value)}
            className={selectClass}
          >
            <option value="non_tech">Non-Technical</option>
            <option value="tech">Technical</option>
          </select>
        </div>

        {/* Committee Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">اسم اللجنة</label>
          <select
            id="meta-committee"
            value={committeeId}
            onChange={(e) => onCommitteeChange(e.target.value)}
            className={committeeSelectClass}
          >
            {committeesData[committeeType].map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">الشهر والتقويم</label>
          <select
            id="meta-month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className={committeeSelectClass}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">مُعدّ التقرير (Supervisor)</label>
          <input
            type="text"
            id="meta-supervisor"
            value={supervisor}
            readOnly={!isEditMode}
            onChange={(e) => onSupervisorChange(e.target.value)}
            className={supervisorTargetClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">الفرع والجهة الموجه إليها</label>
          <input
            type="text"
            id="meta-target"
            value={target}
            readOnly={!isEditMode}
            onChange={(e) => onTargetChange(e.target.value)}
            className={targetClass}
          />
        </div>
      </div>
    </div>
  );
}
