import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { roleLabel } from '../utils/labels';

export default function Header({ isEditMode, onToggleEdit, onCopyReport, onOpenProfile }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('تم تسجيل الخروج بنجاح!');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center text-xl font-black gap-1 tracking-wider">
            <span className="text-gdg-blue">&lt;</span>
            <span className="text-gdg-red">G</span>
            <span className="text-gdg-yellow">D</span>
            <span className="text-gdg-green">G</span>
            <span className="text-gdg-blue">&gt;</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">GDG On Campus Damanhour</h1>
            <p className="text-xs text-slate-400">لوحة التقييم الشهري التفاعلية للجان</p>
          </div>
        </div>

        {/* Action Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleEdit}
            id="edit-mode-btn"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-lg border border-slate-700 transition flex items-center gap-2"
          >
            <i className="fa-solid fa-pen-to-square text-gdg-yellow"></i>
            <span id="edit-btn-text">{isEditMode ? 'حفظ التغييرات' : 'تعديل البيانات'}</span>
          </button>

          <button
            onClick={onCopyReport}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-lg border border-slate-700 transition flex items-center gap-2"
          >
            <i className="fa-solid fa-copy text-gdg-blue"></i>
            <span>نسخ التقرير (Text)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gradient-to-r from-gdg-blue to-blue-600 hover:opacity-90 text-white text-xs sm:text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
          >
            <i className="fa-solid fa-print"></i>
            <span>طباعة / تصدير PDF</span>
          </button>

          {/* Logged-in User Profile & Logout Widget */}
          {user && (
            <div id="header-user-section" className="flex items-center gap-2 sm:gap-3 mr-2 sm:mr-3 pr-2 sm:pr-3 border-r border-slate-800">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 rounded-xl border border-slate-700 transition text-right group"
                title="عرض الملف الشخصي"
              >
                <div
                  id="header-avatar"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-gdg-blue to-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow"
                >
                  {user.name.trim().charAt(0) || 'U'}
                </div>
                <div className="hidden md:block leading-tight">
                  <div className="text-xs font-bold text-slate-100 group-hover:text-white" id="header-user-name">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold" id="header-user-role">
                    {roleLabel(user.role)}
                  </div>
                </div>
              </button>
              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="p-2 sm:px-3 sm:py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-slate-700 hover:border-red-500/30 text-xs font-bold transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span className="hidden lg:inline">خروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
