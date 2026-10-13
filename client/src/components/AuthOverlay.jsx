import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function AuthOverlay() {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(loginEmail, loginPassword, remember);
    setSubmitting(false);
    if (!result.ok) {
      showToast(result.error, 'error');
      return;
    }
    showToast(`مرحباً بك مجدداً يا ${result.user.name}! 👋`, 'success');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    });
    setSubmitting(false);
    if (!result.ok) {
      showToast(result.error, result.warning ? 'warning' : 'error');
      return;
    }
    showToast(`تم إنشاء حسابك بنجاح! أهلاً بك يا ${result.user.name} 🎉`, 'success');
  };

  const activeTabClass =
    'flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all text-white bg-gdg-blue shadow-md flex items-center justify-center gap-1.5';
  const inactiveTabClass =
    'flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5';

  return (
    <div
      id="auth-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto no-print"
    >
      {/* Ambient Glow Circles */}
      <div className="fixed w-72 h-72 rounded-full bg-blue-500/15 filter blur-3xl pointer-events-none -top-10 -right-10"></div>
      <div className="fixed w-72 h-72 rounded-full bg-emerald-500/15 filter blur-3xl pointer-events-none -bottom-10 -left-10"></div>
      <div className="fixed w-64 h-64 rounded-full bg-red-500/10 filter blur-3xl pointer-events-none top-1/2 left-1/4"></div>

      <div className="w-full max-w-md bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl relative overflow-hidden text-right z-10 backdrop-blur-xl">
        {/* Top Colorful Google Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gdg-blue via-gdg-red via-gdg-yellow to-gdg-green"></div>

        <div className="p-6 sm:p-8">
          {/* Logo & Branding Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center text-3xl font-black gap-1 tracking-wider mb-2">
              <span className="text-gdg-blue">&lt;</span>
              <span className="text-gdg-red">G</span>
              <span className="text-gdg-yellow">D</span>
              <span className="text-gdg-green">G</span>
              <span className="text-gdg-blue">&gt;</span>
            </div>
            <h2 className="text-xl font-black text-white">GDG On Campus Damanhour</h2>
            <p className="text-xs text-slate-400 mt-1 font-semibold">بوابة تقييم اللجان ومتابعة الأداء الشهري</p>
          </div>

          {/* Auth Tabs Switcher */}
          <div className="flex bg-slate-800/90 p-1 rounded-xl mb-6 border border-slate-700/60">
            <button
              type="button"
              id="tab-btn-login"
              onClick={() => setActiveTab('login')}
              className={activeTab === 'login' ? activeTabClass : inactiveTabClass}
            >
              <i className="fa-solid fa-right-to-bracket text-xs"></i>
              <span>تسجيل الدخول</span>
            </button>
            <button
              type="button"
              id="tab-btn-register"
              onClick={() => setActiveTab('register')}
              className={activeTab === 'register' ? `${inactiveTabClass.replace('text-slate-400', 'text-white').replace('hover:text-slate-200', '')} bg-gdg-green shadow-md` : inactiveTabClass}
            >
              <i className="fa-solid fa-user-plus text-xs"></i>
              <span>إنشاء حساب جديد</span>
            </button>
          </div>

          {/* ============ LOGIN FORM ============ */}
          <form id="login-form" onSubmit={handleLogin} className={`space-y-4 ${activeTab === 'login' ? '' : 'hidden'}`}>
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute right-3.5 top-3.5 text-slate-400 text-sm"></i>
                <input
                  type="email"
                  id="login-email"
                  required
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-300">كلمة المرور</label>
                <button type="button" onClick={() => setForgotOpen(true)} className="text-[11px] text-gdg-blue hover:underline">
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute right-3.5 top-3.5 text-slate-400 text-sm"></i>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  id="login-password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-10 pl-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                  title="إظهار / إخفاء كلمة المرور"
                >
                  <i className={`fa-solid ${showLoginPassword ? 'fa-eye-slash text-sm text-gdg-blue' : 'fa-eye text-sm'}`}></i>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-gdg-blue focus:ring-0 focus:ring-offset-0"
                />
                <span>تذكر تسجيل دخولي على هذا الجهاز</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-gdg-blue to-blue-600 hover:opacity-95 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 mt-2"
            >
              <i className={`fa-solid ${submitting ? 'fa-circle-notch fa-spin' : 'fa-arrow-right-to-bracket'}`}></i>
              <span>{submitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول إلى اللوحة'}</span>
            </button>
          </form>

          {/* ============ REGISTER FORM ============ */}
          <form id="register-form" onSubmit={handleRegister} className={`space-y-3.5 ${activeTab === 'register' ? '' : 'hidden'}`}>
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute right-3.5 top-3.5 text-slate-400 text-sm"></i>
                <input
                  type="text"
                  id="reg-name"
                  required
                  placeholder="مثال: أحمد محمد"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gdg-green focus:ring-1 focus:ring-gdg-green transition font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute right-3.5 top-3.5 text-slate-400 text-sm"></i>
                <input
                  type="email"
                  id="reg-email"
                  required
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gdg-green focus:ring-1 focus:ring-gdg-green transition font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور (6 خانات على الأقل)</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute right-3.5 top-3.5 text-slate-400 text-sm"></i>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  id="reg-password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-10 pl-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gdg-green focus:ring-1 focus:ring-gdg-green transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword((v) => !v)}
                  className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                >
                  <i className={`fa-solid ${showRegPassword ? 'fa-eye-slash text-sm text-gdg-blue' : 'fa-eye text-sm'}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
              <div className="relative">
                <i className="fa-solid fa-shield-halved absolute right-3.5 top-3.5 text-slate-400 text-sm"></i>
                <input
                  type="password"
                  id="reg-confirm-password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gdg-green focus:ring-1 focus:ring-gdg-green transition font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-gdg-green to-emerald-600 hover:opacity-95 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 mt-2"
            >
              <i className={`fa-solid ${submitting ? 'fa-circle-notch fa-spin' : 'fa-user-check'}`}></i>
              <span>{submitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب والدخول فوراً'}</span>
            </button>
          </form>
        </div>
      </div>

      {forgotOpen && <ForgotPasswordModal initialEmail={loginEmail} onClose={() => setForgotOpen(false)} />}
    </div>
  );
}
