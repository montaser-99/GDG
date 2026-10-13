import { useState } from 'react';

// No password-reset endpoint exists in the backend, and plaintext passwords
// must never be revealed. Show a safe message instead.
export default function ForgotPasswordModal({ initialEmail, onClose }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div id="forgot-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-right relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-gdg-yellow to-gdg-red absolute top-0 right-0 left-0"></div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 mt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-key text-gdg-yellow"></i> استعادة كلمة المرور
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {submitted ? (
          <div className="p-3 rounded-xl text-xs font-semibold bg-gdg-blue/10 border border-gdg-blue/30 text-gdg-blue leading-relaxed">
            تم تسجيل طلبك. كلمة المرور لا يمكن استرجاعها تلقائياً لأسباب أمنية،
            يرجى التواصل مع مسؤول الموارد البشرية (Head HR) لإعادة تعيين كلمة المرور الخاصة بك.
          </div>
        ) : (
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            لأسباب أمنية، لا يمكن عرض كلمة المرور الخاصة بك. اضغط الزر بالأسفل لتسجيل طلب إعادة التعيين
            والتواصل مع مسؤول الموارد البشرية.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!submitted && (
            <input
              type="email"
              id="forgot-email"
              required
              defaultValue={initialEmail || ''}
              placeholder="name@example.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gdg-blue font-medium"
            />
          )}
          <div className="flex gap-2 pt-2">
            {!submitted && (
              <button type="submit" className="flex-1 py-2.5 bg-gdg-blue hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition shadow">
                طلب إعادة تعيين كلمة المرور
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`${submitted ? 'w-full' : 'px-4'} py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition`}
            >
              إغلاق
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
