const boxTextareaClass =
  'w-full bg-slate-900/60 border border-slate-300 rounded-xl p-3 text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-sm resize-y read-only:bg-transparent read-only:border-none read-only:p-0 read-only:shadow-none read-only:resize-none print:hidden';

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
        <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <label className="block text-xs font-bold text-amber-500 mb-1.5">
            <i className="fa-solid fa-triangle-exclamation"></i> أعضاء يحتاجون توجيه إنذار (Warning):
          </label>
          <textarea
            id="hr-warnings"
            rows="4"
            value={warnings}
            readOnly={!isEditMode}
            onChange={(e) => onChange('warnings', e.target.value)}
            className={`${boxTextareaClass} min-h-[110px] focus:border-amber-400 focus:ring-amber-400/20`}
            style={{ fieldSizing: 'content' }}
          ></textarea>
          <div className="hidden print:block whitespace-pre-wrap break-words text-slate-900 font-bold text-xs leading-relaxed pt-1">
            {warnings || '—'}
          </div>
        </div>

        {/* Filteration List */}
        <div className="p-3.5 bg-red-500/10 rounded-xl border border-red-500/20">
          <label className="block text-xs font-bold text-red-500 mb-1.5">
            <i className="fa-solid fa-user-slash"></i> أعضاء مرشحين للفلترة/الاستبعاد (Filteration):
          </label>
          <textarea
            id="hr-filteration"
            rows="4"
            value={filteration}
            readOnly={!isEditMode}
            onChange={(e) => onChange('filteration', e.target.value)}
            className={`${boxTextareaClass} min-h-[110px] focus:border-red-400 focus:ring-red-400/20`}
            style={{ fieldSizing: 'content' }}
          ></textarea>
          <div className="hidden print:block whitespace-pre-wrap break-words text-slate-900 font-bold text-xs leading-relaxed pt-1">
            {filteration || '—'}
          </div>
        </div>

        {/* Recognition & Best Member */}
        <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <label className="block text-xs font-bold text-emerald-500 mb-1.5">
            <i className="fa-solid fa-award"></i> العضو المتميز لهذا الشهر (Best Member):
          </label>
          <textarea
            id="hr-best-member"
            rows="3"
            value={bestMember}
            readOnly={!isEditMode}
            onChange={(e) => onChange('bestMember', e.target.value)}
            className={`${boxTextareaClass} min-h-[90px] focus:border-emerald-400 focus:ring-emerald-400/20`}
            style={{ fieldSizing: 'content' }}
          ></textarea>
          <div className="hidden print:block whitespace-pre-wrap break-words text-slate-900 font-bold text-xs leading-relaxed pt-1">
            {bestMember || '—'}
          </div>
        </div>

        {/* Development & Fun Session Recommendations */}
        <div className="p-3.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <label className="block text-xs font-bold text-gdg-blue mb-1.5">
            <i className="fa-solid fa-lightbulb"></i> المقترحات وتوصيات من HR:
          </label>
          <textarea
            id="hr-general-recs"
            rows="4"
            value={generalRecs}
            readOnly={!isEditMode}
            onChange={(e) => onChange('generalRecs', e.target.value)}
            className={`${boxTextareaClass} min-h-[110px] focus:border-gdg-blue focus:ring-blue-400/20`}
            style={{ fieldSizing: 'content' }}
          ></textarea>
          <div className="hidden print:block whitespace-pre-wrap break-words text-slate-900 font-bold text-xs leading-relaxed pt-1">
            {generalRecs || '—'}
          </div>
        </div>
      </div>

    </section>
  );
}
