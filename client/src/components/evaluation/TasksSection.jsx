import { useState } from 'react';
import { statusMap } from '../../utils/calculations';

// Small inline modal replacing the original prompt()-based task adding
const TASK_STATUSES = [
  { value: 'completed', label: 'مكتملة ✅' },
  { value: 'in_progress', label: 'قيد التنفيذ ⏳' },
  { value: 'delayed', label: 'متأخرة ⚠️' },
];

function AddTaskModal({ onSubmit, onClose }) {
  const [taskText, setTaskText] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    onSubmit(taskText.trim(), assignedTo.trim() || 'عضو اللجنة');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-right relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-gdg-green to-emerald-600 absolute top-0 right-0 left-0"></div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 mt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-plus text-gdg-green"></i> إضافة مهمة جديدة
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">تفاصيل المهمة الجديدة</label>
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              required
              autoFocus
              placeholder="عنوان تفاصيل المهمة"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gdg-green font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم العضو أو الفريق المسند إليه المهمة</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="عضو اللجنة"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gdg-green font-medium"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gdg-green hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow"
            >
              إدراج المهمة
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksSection({ tasks, isEditMode, onAdd, onRemove, onUpdate }) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAddSubmit = (text, assigned) => {
    onAdd(text, assigned);
    setAddModalOpen(false);
  };

  return (
    <section className="glass-card print-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800 print-section-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gdg-green/20 text-gdg-green flex items-center justify-center font-bold">2</div>
          <div>
            <h2 className="text-lg font-bold text-white">
              تقييم المهام وأداء أعضاء اللجنة{' '}
              <span className="text-xs text-slate-400 font-normal">(Tasks & Members Evaluation)</span>
            </h2>
            <p className="text-xs text-slate-400">تقييم مدى انضباط كافة أعضاء اللجنة في التنفيذ والتأخيرات</p>
          </div>
        </div>
        {isEditMode && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3 py-1 bg-gdg-green/20 text-gdg-green hover:bg-gdg-green/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
          >
            <i className="fa-solid fa-plus"></i> إضافة مهمة
          </button>
        )}
      </div>

      {/* Task List Container */}
      <div className="space-y-3 mb-4" id="task-list">
        {tasks.map((t, idx) => {
          if (isEditMode) {
            return (
              <div
                key={idx}
                className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 transition hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="w-full space-y-2">
                    <input
                      type="text"
                      value={t.text}
                      onChange={(e) => onUpdate(idx, 'text', e.target.value)}
                      placeholder="عنوان تفاصيل المهمة"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-gdg-blue"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 shrink-0">
                        <i className="fa-solid fa-user-tag text-[10px]"></i> المكلف:
                      </span>
                      <input
                        type="text"
                        value={t.assigned}
                        onChange={(e) => onUpdate(idx, 'assigned', e.target.value)}
                        placeholder="اسم/فريق العضو المسند إليه"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-gdg-blue"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <select
                      value={t.status}
                      onChange={(e) => onUpdate(idx, 'status', e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-xs font-bold rounded-lg p-2 focus:outline-none focus:border-gdg-blue text-slate-200"
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => onRemove(idx)}
                      className="p-2 text-red-400 hover:text-red-300 rounded-lg bg-red-500/10 border border-red-500/20 text-xs"
                      title="حذف المهمة"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          const st = statusMap[t.status] || statusMap.completed;
          return (
            <div
              key={idx}
              className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 transition hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 ${st.class.split(' ')[0]} text-base`}>
                    <i className="fa-solid fa-circle-check"></i>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{t.text}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      <i className="fa-solid fa-user-tag text-[10px]"></i> المكلف بالتنفيذ: {t.assigned}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold border rounded-md shrink-0 print-badge ${st.class}`}>
                  {st.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {addModalOpen && <AddTaskModal onSubmit={handleAddSubmit} onClose={() => setAddModalOpen(false)} />}
    </section>
  );
}
