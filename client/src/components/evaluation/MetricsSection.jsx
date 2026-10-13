export default function MetricsSection({ commScore, deadlineScore, isEditMode, onCommChange, onDeadlineChange }) {
  return (
    <section className="glass-card print-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800 print-section-header">
        <div className="w-9 h-9 rounded-xl bg-gdg-yellow/20 text-gdg-yellow flex items-center justify-center font-bold">3</div>
        <div>
          <h2 className="text-lg font-bold text-white">
            مؤشرات أداء اللجنة العامة{' '}
            <span className="text-xs text-slate-400 font-normal">(Committee Metrics)</span>
          </h2>
          <p className="text-xs text-slate-400">التواصل، التنسيق، والالتزام بالـ Deadlines</p>
        </div>
      </div>

      {/* Sliders & Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-300">مستوى التواصل والتنسيق الداخلي</label>
            <span id="comm-score-val" className="text-xs font-extrabold text-gdg-blue">
              {commScore}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
            <div
              id="comm-bar"
              className="bg-gdg-blue h-2 rounded-full transition-all duration-500"
              style={{ width: `${commScore}%` }}
            ></div>
          </div>
          {isEditMode && (
            <input
              type="range"
              id="comm-input"
              min="0"
              max="100"
              value={commScore}
              onChange={(e) => onCommChange(parseInt(e.target.value) || 0)}
              className="w-full"
            />
          )}
          <p className="text-xs text-slate-400">سرعة الاستجابة والتفاعل على الجروبات الرسمية وتمرير التعليمات.</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-300">الالتزام بالمواعيد النهائيّة (Deadlines)</label>
            <span id="deadline-score-val" className="text-xs font-extrabold text-gdg-yellow">
              {deadlineScore}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
            <div
              id="deadline-bar"
              className="bg-gdg-yellow h-2 rounded-full transition-all duration-500"
              style={{ width: `${deadlineScore}%` }}
            ></div>
          </div>
          {isEditMode && (
            <input
              type="range"
              id="deadline-input"
              min="0"
              max="100"
              value={deadlineScore}
              onChange={(e) => onDeadlineChange(parseInt(e.target.value) || 0)}
              className="w-full"
            />
          )}
          <p className="text-xs text-slate-400">تسليم معظم التأسكات في وقتها المحدد مع معالجة التأخيرات الفردية.</p>
        </div>
      </div>

      {/* Strengths vs Areas for Improvement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i className="fa-solid fa-shield-halved"></i> نقاط القوة والتميز للجنة
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-emerald-400 mt-0.5"></i>
              السرعة والمرونة العالية في التعامل مع التحديات المفاجئة.
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-emerald-400 mt-0.5"></i>
              روح التعاون العالية وتغطية الأعضاء لمهام بعضهم عند الضغط.
            </li>
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-gdg-red/5 rounded-xl p-4 border border-gdg-red/20">
          <h4 className="text-xs font-bold text-gdg-red uppercase tracking-wider mb-3 flex items-center gap-2">
            <i className="fa-solid fa-arrow-up-right-dots"></i> نقاط التحسين المطلوب العمل عليها
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-circle-exclamation text-gdg-red mt-0.5"></i>
              تحسين جدولة المهام لتجنب تكدس العمل في الساعات الأخيرة.
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-circle-exclamation text-gdg-red mt-0.5"></i>
              التوثيق المكتوب والتأكيد على استلام التاسك رسمياً.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
