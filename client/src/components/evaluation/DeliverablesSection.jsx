export default function DeliverablesSection({ deliverables, isEditMode, onChange }) {
  return (
    <section className="glass-card print-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800 print-section-header">
        <div className="w-9 h-9 rounded-xl bg-gdg-yellow/20 text-gdg-yellow flex items-center justify-center font-bold">5</div>
        <div>
          <h2 className="text-lg font-bold text-white">
            أبرز مخرجات وإنجازات الشهر{' '}
            <span className="text-xs text-slate-400 font-normal">(Key Monthly Deliverables)</span>
          </h2>
          <p className="text-xs text-slate-400">أهم النتائج والمخرجات الملموسة التي حققتها اللجنة خلال الشهر</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            <i className="fa-solid fa-box-archive text-gdg-yellow"></i> أهم المخرجات والإنجازات المحققة
          </label>
          <textarea
            id="monthly-deliverables"
            rows="3"
            value={deliverables}
            readOnly={!isEditMode}
            onChange={(e) => onChange('deliverables', e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-gdg-blue transition read-only:bg-transparent read-only:border-none read-only:p-0"
          ></textarea>
        </div>
      </div>
    </section>
  );
}
