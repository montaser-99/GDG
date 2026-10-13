import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { roleLabel, formatJoinedDate } from '../utils/labels';

export default function ProfileModal({ onClose }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  if (!user) return null;

  const initial = user.name.trim().charAt(0) || 'U';

  const handleLogout = async () => {
    await logout();
    onClose();
    showToast('تم تسجيل الخروج بنجاح!');
  };

  return (
    <div id="profile-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-right relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-gdg-blue via-gdg-red to-gdg-green absolute top-0 right-0 left-0"></div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 mt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-id-badge text-gdg-blue"></i> الملف الشخصي للعضو
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex flex-col items-center text-center p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 mb-4">
          <div
            id="profile-modal-avatar"
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gdg-blue via-indigo-600 to-gdg-green text-white text-2xl font-black flex items-center justify-center shadow-lg mb-2"
          >
            {initial}
          </div>
          <h4 id="profile-modal-name" className="text-base font-bold text-white">
            {user.name}
          </h4>
          <p id="profile-modal-email" className="text-xs text-slate-400 mt-0.5">
            {user.email}
          </p>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span id="profile-modal-role" className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gdg-blue/20 text-gdg-blue border border-gdg-blue/30">
              {roleLabel(user.role)}
            </span>
            <span id="profile-modal-comm" className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700 text-slate-300">
              {user.committee || 'عام'}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
            <span className="text-slate-400">تاريخ الانضمام:</span>
            <span id="profile-modal-date" className="font-bold text-slate-200">
              {formatJoinedDate(user.joinedDate)}
            </span>
          </div>
          <div className="flex justify-between items-center p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
            <span className="text-slate-400">الفرع:</span>
            <span className="font-bold text-slate-200">GDG On Campus Damanhour</span>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>تسجيل الخروج</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
