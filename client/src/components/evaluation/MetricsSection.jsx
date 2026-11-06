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

    </section>
  );
}
