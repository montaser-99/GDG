const boxTextareaClass =
  'w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none read-only:bg-transparent read-only:border-none read-only:p-0';

export default function RecommendationsSection({ warnings, filteration, bestMember, generalRecs, isEditMode, onChange }) {
  return (
    <section className="glass-card print-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800 print-section-header">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">6</div>
        <div>
          <h2 className="text-lg font-bold text-white">توصيات الـ Supervisor</h2>
          <p className="text-xs text-slate-400">قرارات الإنذارات، الفلترة، التكريم والدعم</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Warning List */}
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <label className="block text-xs font-bold text-amber-400 mb-1">
            <i className="fa-solid fa-triangle-exclamation"></i> أعضاء يحتاجون توجيه إنذار (Warning):
          </label>
          <textarea
            id="hr-warnings"
            rows="2"
            value={warnings}
            readOnly={!isEditMode}
            onChange={(e) => onChange('warnings', e.target.value)}
            className={`${boxTextareaClass} focus:border-amber-400`}
          ></textarea>
        </div>

        {/* Filteration List */}
        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <label className="block text-xs font-bold text-red-400 mb-1">
            <i className="fa-solid fa-user-slash"></i> أعضاء مرشحين للفلترة/الاستبعاد (Filteration):
          </label>
          <textarea
            id="hr-filteration"
            rows="2"
            value={filteration}
            readOnly={!isEditMode}
            onChange={(e) => onChange('filteration', e.target.value)}
            className={`${boxTextareaClass} focus:border-red-400`}
          ></textarea>
        </div>

        {/* Recognition & Best Member */}
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <label className="block text-xs font-bold text-emerald-400 mb-1">
            <i className="fa-solid fa-award"></i> العضو المتميز لهذا الشهر (Best Member):
          </label>
          <textarea
            id="hr-best-member"
            rows="1"
            value={bestMember}
            readOnly={!isEditMode}
            onChange={(e) => onChange('bestMember', e.target.value)}
            className={`${boxTextareaClass} focus:border-emerald-400`}
          ></textarea>
        </div>

        {/* Development & Fun Session Recommendations */}
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <label className="block text-xs font-bold text-gdg-blue mb-1">
            <i className="fa-solid fa-lightbulb"></i> المقترحات وتوصيات من HR:
          </label>
          <textarea
            id="hr-general-recs"
            rows="2"
            value={generalRecs}
            readOnly={!isEditMode}
            onChange={(e) => onChange('generalRecs', e.target.value)}
            className={`${boxTextareaClass} focus:border-gdg-blue`}
          ></textarea>
        </div>
      </div>

      {/* Supervisor Approval Stamp */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">اعتماد وتوقيع المعتمد</p>
          <p className="text-sm font-bold text-slate-200 mt-1" id="signature-name">
            Dyaa Abdullah (Head HR)
          </p>
          <p className="text-xs text-slate-400 mt-0.5">GDG On Campus Damanhour</p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-gdg-blue/60 flex items-center justify-center text-gdg-blue">
          <i className="fa-solid fa-stamp text-lg"></i>
        </div>
      </div>
    </section>
  );
}
