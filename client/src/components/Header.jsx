import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../utils/labels';

export default function Header({
  isEditMode,
  onToggleEdit,
  onCopyReport,
  onOpenProfile,
  view,
  onNavigate,
  canUseLeaderboard,
}) {
  const { user, logout } = useAuth();

  return (
    <header className="app-header no-print" dir="rtl">
      <div className="app-header-inner">
        <a className="app-brand" href="#home" onClick={(event) => event.preventDefault()}>
          <span className="app-brand-mark" aria-hidden="true">
            <b>G</b><b>D</b><b>G</b>
          </span>
          <span className="app-brand-copy">
            <strong>GDG On Campus</strong>
            <small>Damanhour University</small>
          </span>
        </a>

        <nav className="app-header-nav" aria-label="التنقل الرئيسي">
          <button
            type="button"
            className={`app-nav-button ${view === 'report' ? 'is-active' : ''}`}
            aria-current={view === 'report' ? 'page' : undefined}
            onClick={() => onNavigate('report')}
          >
            <i className="fa-regular fa-file-lines" aria-hidden="true" />
            <span>تقرير اللجنة</span>
          </button>
          {canUseLeaderboard && (
            <button
              type="button"
              className={`app-nav-button ${view === 'leaderboard' ? 'is-active' : ''}`}
              aria-current={view === 'leaderboard' ? 'page' : undefined}
              onClick={() => onNavigate('leaderboard')}
            >
              <i className="fa-solid fa-chart-column" aria-hidden="true" />
              <span>ترتيب اللجان</span>
            </button>
          )}
        </nav>

        <div className="app-header-actions">
          {view === 'report' && (
            <>
              <button type="button" className="app-button app-button-secondary" onClick={onToggleEdit}>
                <i className={`fa-solid ${isEditMode ? 'fa-floppy-disk' : 'fa-pen-to-square'}`} aria-hidden="true" />
                <span>{isEditMode ? 'حفظ التعديلات' : 'تعديل التقرير'}</span>
              </button>
              <button type="button" className="app-button app-button-quiet" onClick={onCopyReport}>
                <i className="fa-regular fa-copy" aria-hidden="true" />
                <span>نسخ التقرير</span>
              </button>
            </>
          )}
          <button type="button" className="app-button app-button-primary" onClick={() => window.print()}>
            <i className="fa-solid fa-print" aria-hidden="true" />
            <span>طباعة</span>
          </button>

          {user && (
            <div className="app-user-menu">
              <button type="button" className="app-profile-button" onClick={onOpenProfile}>
                <span className="app-avatar" aria-hidden="true">{user.name?.trim().charAt(0) || 'U'}</span>
                <span className="app-profile-copy">
                  <strong>{user.name}</strong>
                  <small>{roleLabel(user.role)}</small>
                </span>
              </button>
              <button
                type="button"
                className="app-icon-button"
                onClick={logout}
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
              >
                <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
