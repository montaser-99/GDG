import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import gdgLogo from '../assets/gdg-logo.png';

export default function AuthOverlay() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand-row">
          <img src={gdgLogo} alt="GDG On Campus Damanhour University" className="auth-brand-logo" />
        </div>
        <div className="auth-heading">
          <p className="eyebrow auth-eyebrow-large">منصة متابعة الأداء وتقييم اللجان</p>
          <h1 id="auth-title">سجّل دخولك لمتابعة تقارير اللجان.</h1>
        </div>
        <form className="auth-form" onSubmit={handleLogin}>
          <label className="auth-field">
            <span>البريد الإلكتروني</span>
            <input className="auth-input" type="email" autoComplete="username" required value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="name@example.com" />
          </label>
          <label className="auth-field">
            <span>كلمة المرور</span>
            <div className="auth-password-field">
              <input className="auth-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="اكتب كلمة المرور" />
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
          <p className="auth-note">الحسابات تُنشأ بواسطة مسؤول النظام. تواصل مع مسؤول الموارد البشرية للحصول على حساب أو صلاحية.</p>
        </form>
      </section>
      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </main>
  );
}
