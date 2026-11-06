export default function ForgotPasswordModal({ onClose }) {
  return (
    <div className="auth-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-info-modal" role="dialog" aria-modal="true" aria-labelledby="forgot-title" dir="rtl">
        <span className="insight-icon tone-yellow" aria-hidden="true"><i className="fa-solid fa-key" /></span>
        <h2 id="forgot-title">إعادة تعيين كلمة المرور</h2>
        <p>إعادة التعيين التلقائية مش متاحة في المنصة حاليًا. تواصل مع مسؤول الموارد البشرية عشان يغيّر كلمة المرور بأمان.</p>
        <button type="button" className="app-button app-button-primary" onClick={onClose}>تمام</button>
      </section>
    </div>
  );
}
