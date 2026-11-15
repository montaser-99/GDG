const textareaClass =
  'w-full bg-slate-900/60 border border-slate-300 rounded-xl p-3 text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none focus:border-gdg-blue focus:ring-2 focus:ring-blue-400/20 transition resize-y min-h-[105px] read-only:bg-transparent read-only:border-none read-only:p-0 read-only:resize-none print:hidden';

export default function ChallengesSection({ challenges, solutions, isEditMode, onChange }) {
  return (
    <section className="glass-card print-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800 print-section-header">
        <div className="w-9 h-9 rounded-xl bg-gdg-red/20 text-gdg-red flex items-center justify-center font-bold">4</div>
        <div>
          <h2 className="text-lg font-bold text-white">
            التحديات والحلول المقترحة{' '}
            <span className="text-xs text-slate-400 font-normal">(Challenges & Solutions)</span>
          </h2>
          <p className="text-xs text-slate-400">العقبات التي واجهت اللجنة وكيفية التعامل معها</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            <i className="fa-solid fa-triangle-exclamation text-amber-400"></i> التحديات التي واجهت عمل اللجنة
          </label>
          <textarea
            id="committee-challenges"
            rows="4"
            value={challenges}
            readOnly={!isEditMode}
            onChange={(e) => onChange('challenges', e.target.value)}
            className={textareaClass}
            style={{ fieldSizing: 'content' }}
          ></textarea>
          <div className="hidden print:block whitespace-pre-wrap break-words text-slate-900 font-bold text-xs leading-relaxed pt-1">
            {challenges || '—'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            <i className="fa-solid fa-lightbulb text-gdg-green"></i> الحلول والإجراءات المتخذة
          </label>
          <textarea
            id="committee-solutions"
            rows="4"
            value={solutions}
            readOnly={!isEditMode}
            onChange={(e) => onChange('solutions', e.target.value)}
            className={textareaClass}
            style={{ fieldSizing: 'content' }}
          ></textarea>
          <div className="hidden print:block whitespace-pre-wrap break-words text-slate-900 font-bold text-xs leading-relaxed pt-1">
            {solutions || '—'}
          </div>
        </div>
      </div>
    </section>
  );
}
