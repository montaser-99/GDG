import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PasswordChange() {
  const { changePassword } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('كلمتا المرور غير متطابقتين.', 'error');
      return;
    }
    setSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setSaving(false);
    if (result.ok) showToast('تم تغيير كلمة المرور. سجّل الدخول مجددًا.', 'success');
    else showToast(result.error, 'error');
  };

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-card" aria-labelledby="password-title">
        <div className="auth-brand-row"><span className="app-brand-mark" aria-hidden="true"><b>G</b><b>D</b><b>G</b></span><span><strong>GDG On Campus</strong><small>Damanhour University</small></span></div>
        <div className="auth-heading"><p className="eyebrow">خطوة أمان مطلوبة</p><h1 id="password-title">غيّر كلمة المرور المؤقتة</h1><p>اختر كلمة مرور جديدة لا تقل عن 12 حرفًا.</p></div>
        <form className="auth-form" onSubmit={submit}>
          <label className="auth-field"><span>كلمة المرور الحالية</span><input className="auth-input" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
          <label className="auth-field"><span>كلمة المرور الجديدة</span><input className="auth-input" type="password" autoComplete="new-password" required minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
          <label className="auth-field"><span>تأكيد كلمة المرور الجديدة</span><input className="auth-input" type="password" autoComplete="new-password" required minLength={12} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
          <button className="auth-submit" type="submit" disabled={saving}>{saving ? 'جارٍ التحديث…' : 'تغيير كلمة المرور'}</button>
        </form>
      </section>
    </main>
  );
}
