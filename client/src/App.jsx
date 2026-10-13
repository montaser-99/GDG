import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Dashboard from './pages/Dashboard';
import AuthOverlay from './components/AuthOverlay';
import ToastContainer from './components/ToastContainer';

function AppContent() {
  const { user, authLoading } = useAuth();

  // Checking the existing session: keep the dashboard hidden until /api/auth/me resolves.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950" dir="rtl">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gdg-blue"></i>
          <p className="text-slate-300 text-sm font-semibold mt-3">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {user && <Dashboard />}
      {!user && <AuthOverlay />}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
