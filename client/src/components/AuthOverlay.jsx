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
  const [showPassword, setShowPassword] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await login(loginEmail, loginPassword, remember);
      if (!result.ok) {
        showToast(result.error, 'error');
        return;
      }
      showToast(`أهلًا ${result.user.name}`, 'success');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });
      if (!result.ok) {
        showToast(result.error, result.warning ? 'warning' : 'error');
        return;
      }
      showToast('اتعمل الحساب. تفعيل صلاحية التقارير بيتم عن طريق مسؤول الفرع.', 'success');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'auth-input';

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand-row">
          <span className="app-brand-mark" aria-hidden="true"><b>G</b><b>D</b><b>G</b></span>
          <span><strong>GDG On Campus</strong><small>Damanhour University</small></span>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">منصة متابعة الأداء</p>
          <h1 id="auth-title">أهلًا بيك</h1>
          <p>سجّل دخولك لمتابعة تقارير اللجان.</p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="اختيار الدخول أو إنشاء حساب">
          <button type="button" role="tab" aria-selected={activeTab === 'login'} className={activeTab === 'login' ? 'is-active' : ''} onClick={() => setActiveTab('login')}>تسجيل الدخول</button>
          <button type="button" role="tab" aria-selected={activeTab === 'register'} className={activeTab === 'register' ? 'is-active' : ''} onClick={() => setActiveTab('register')}>إنشاء حساب</button>
        </div>

        {activeTab === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-field">
              <span>البريد الإلكتروني</span>
              <input className={inputClass} type="email" autoComplete="username" required value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="name@example.com" />
            </label>
            <label className="auth-field">
              <span>كلمة المرور</span>
              <div className="auth-password-field">
                <input className={inputClass} type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="اكتب كلمة المرور" />
                <button type="button" className="auth-password-toggle" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={() => setShowPassword((visible) => !visible)}>
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                </button>
              </div>
            </label>
            <div className="auth-form-options">
              <label className="auth-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>افتكرني على الجهاز ده</span></label>
              <button type="button" className="auth-link" onClick={() => setForgotOpen(true)}>نسيت كلمة المرور؟</button>
            </div>
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> : <i className="fa-solid fa-arrow-right-to-bracket" aria-hidden="true" />}
              {submitting ? 'جاري تسجيل الدخول…' : 'دخول للمنصة'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <label className="auth-field"><span>الاسم</span><input className={inputClass} type="text" autoComplete="name" required minLength={2} value={regName} onChange={(event) => setRegName(event.target.value)} placeholder="اسمك بالكامل" /></label>
            <label className="auth-field"><span>البريد الإلكتروني</span><input className={inputClass} type="email" autoComplete="email" required value={regEmail} onChange={(event) => setRegEmail(event.target.value)} placeholder="name@example.com" /></label>
            <label className="auth-field"><span>كلمة المرور <small>٦ خانات على الأقل</small></span><input className={inputClass} type={showRegPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6} value={regPassword} onChange={(event) => setRegPassword(event.target.value)} placeholder="اختار كلمة مرور" /></label>
            <label className="auth-field"><span>تأكيد كلمة المرور</span><input className={inputClass} type={showRegPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6} value={regConfirmPassword} onChange={(event) => setRegConfirmPassword(event.target.value)} placeholder="اكتبها مرة تانية" /></label>
            <label className="auth-remember"><input type="checkbox" checked={showRegPassword} onChange={(event) => setShowRegPassword(event.target.checked)} /><span>إظهار كلمة المرور أثناء الكتابة</span></label>
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> : <i className="fa-solid fa-user-plus" aria-hidden="true" />}
              {submitting ? 'جاري إنشاء الحساب…' : 'إنشاء حساب'}
            </button>
            <p className="auth-note">الحسابات الجديدة تحتاج تفعيل صلاحية من مسؤول الفرع قبل فتح تقارير اللجان.</p>
          </form>
        )}
      </section>
      {forgotOpen && <ForgotPasswordModal initialEmail={loginEmail} onClose={() => setForgotOpen(false)} />}
    </main>
  );
}
