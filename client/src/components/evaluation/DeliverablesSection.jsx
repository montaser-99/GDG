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

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            <i className="fa-solid fa-box-archive text-gdg-yellow"></i> أهم المخرجات والإنجازات المحققة
          </label>
          <textarea
            id="monthly-deliverables"
            rows="4"
            value={deliverables}
            readOnly={!isEditMode}
            onChange={(e) => onChange('deliverables', e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-300 rounded-xl p-3 text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none focus:border-gdg-blue focus:ring-2 focus:ring-blue-400/20 transition min-h-[105px] resize-y read-only:bg-transparent read-only:border-none read-only:p-0 read-only:resize-none print:hidden"
            style={{ fieldSizing: 'content' }}
          ></textarea>
          <div className="hidden print:block whitespace-pre-wrap break-words text-slate-900 font-bold text-xs leading-relaxed pt-1">
            {deliverables || '—'}
          </div>
        </div>
      </div>
    </section>
  );
}
