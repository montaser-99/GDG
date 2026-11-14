import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';
import { committeesData } from '../data/committees';
import { roleLabel } from '../utils/labels';
import { useToast } from '../context/ToastContext';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'supervisor', committee: '', isActive: true };
const roleOptions = [
  { value: 'head_hr', label: 'Admin / Head HR' },
  { value: 'leaderboard_viewer', label: 'Leaderboard (قراءة فقط)' },
  { value: 'supervisor', label: 'Supervisor' },
];

function dateLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '—' : new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(date);
}

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [filters, setFilters] = useState({ search: '', role: '', committee: '', status: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const committeeOptions = useMemo(() => committeesData, []);
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50', ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) });
      const result = await api.get(`/admin/users${params.size ? `?${params}` : ''}`);
      setUsers(result.users || []);
      setStats(result.stats || null);
      setPagination(result.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'تعذر تحميل الحسابات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [filters.search, filters.role, filters.committee, filters.status, page]);
  const changeFilter = (key, value) => { setPage(1); setFilters((current) => ({ ...current, [key]: value })); };

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        committee: form.role === 'supervisor' ? form.committee : null,
        isActive: form.isActive,
      };
      if (editingId) {
        await api.patch(`/admin/users/${editingId}`, payload);
        showToast('تم تحديث بيانات الحساب.', 'success');
      } else {
        await api.post('/admin/users', { ...payload, password: form.password });
        showToast('تم إنشاء الحساب. سلّم كلمة المرور المؤقتة عبر قناة آمنة.', 'success');
      }
      resetForm();
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'تعذر حفظ الحساب.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user) => {
    setEditingId(user._id);
    setForm({ name: user.name || '', email: user.email || '', password: '', role: user.role, committee: user.committee || '', isActive: user.isActive !== false });
    setResetTarget(null);
  };

  const setStatus = async (user, isActive) => {
    try {
      await api.patch(`/admin/users/${user._id}`, { isActive });
      showToast(isActive ? 'تم تفعيل الحساب.' : 'تم إيقاف الحساب وإلغاء جلساته.', 'success');
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'تعذر تغيير حالة الحساب.', 'error');
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!resetTarget) return;
    try {
      await api.post(`/admin/users/${resetTarget._id}/reset-password`, { password: resetPassword });
      showToast('تم تغيير كلمة المرور وإلغاء الجلسات السابقة.', 'success');
      setResetTarget(null);
      setResetPassword('');
    } catch (err) {
      showToast(err.message || 'تعذر تغيير كلمة المرور.', 'error');
    }
  };

  const statCards = stats ? [
    ['إجمالي الحسابات', stats.totalUsers],
    ['الحسابات النشطة', stats.activeAccounts],
    ['الحسابات الموقوفة', stats.inactiveAccounts],
    ['Admin', stats.admins],
    ['Leaderboard', stats.leaderboardViewers],
    ['Supervisors', stats.supervisors],
    ['لجان لها مشرف', stats.committeesWithSupervisors],
    ['لجان بلا مشرف', stats.committeesWithoutSupervisors.length],
  ] : [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" dir="rtl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">إدارة النظام</p><h1 className="text-2xl font-black text-white">إدارة الحسابات</h1></div>
        <button type="button" className="app-button app-button-secondary" onClick={loadUsers} disabled={loading}>تحديث البيانات</button>
      </div>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="إحصاءات الحسابات">
        {statCards.map(([label, value]) => <article key={label} className="glass-card rounded-xl p-4"><p className="text-xs text-slate-400">{label}</p><strong className="mt-1 block text-2xl text-white">{value}</strong></article>)}
      </section>
      {!!stats?.committeesWithoutSupervisors.length && <p className="mb-5 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">لجان بلا مشرف: {stats.committeesWithoutSupervisors.join('، ')}</p>}

      <section className="glass-card mb-8 rounded-2xl p-5">
        <h2 className="mb-4 text-lg font-bold text-white">{editingId ? 'تعديل حساب' : 'إنشاء حساب'}</h2>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={handleSubmit}>
          <label className="auth-field"><span>الاسم الكامل</span><input className="auth-input" required minLength={2} maxLength={100} value={form.name} onChange={(event) => setField('name', event.target.value)} /></label>
          <label className="auth-field"><span>البريد الإلكتروني</span><input className="auth-input" type="email" required value={form.email} onChange={(event) => setField('email', event.target.value)} /></label>
          <label className="auth-field"><span>الدور</span><select className="auth-input" value={form.role} onChange={(event) => setField('role', event.target.value)}>{editingId && form.role === 'member' && <option value="member">Member (legacy)</option>}{roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
          {form.role === 'supervisor' && <label className="auth-field"><span>اللجنة المسندة</span><select className="auth-input" required value={form.committee} onChange={(event) => setField('committee', event.target.value)}><option value="">اختر لجنة</option>{Object.entries(committeeOptions).map(([type, committees]) => <optgroup key={type} label={type === 'tech' ? 'Technical' : 'Non-Technical'}>{committees.map((committee) => <option key={committee.id} value={committee.id}>{committee.name}</option>)}</optgroup>)}</select></label>}
          {!editingId && <label className="auth-field"><span>كلمة مرور مؤقتة (12 حرفًا على الأقل)</span><input className="auth-input" type="password" required minLength={12} autoComplete="new-password" value={form.password} onChange={(event) => setField('password', event.target.value)} /></label>}
          <label className="auth-remember self-end"><input type="checkbox" checked={form.isActive} onChange={(event) => setField('isActive', event.target.checked)} /><span>الحساب نشط</span></label>
          <div className="flex items-end gap-2"><button className="app-button app-button-primary" type="submit" disabled={saving}>{saving ? 'جارٍ الحفظ…' : editingId ? 'حفظ التعديلات' : 'إنشاء الحساب'}</button>{editingId && <button className="app-button app-button-quiet" type="button" onClick={resetForm}>إلغاء</button>}</div>
        </form>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><h2 className="text-lg font-bold text-white">الحسابات</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <input className="auth-input" aria-label="بحث بالاسم أو البريد" placeholder="بحث بالاسم أو البريد" value={filters.search} onChange={(event) => changeFilter('search', event.target.value)} />
            <select className="auth-input" aria-label="تصفية حسب الدور" value={filters.role} onChange={(event) => changeFilter('role', event.target.value)}><option value="">كل الأدوار</option>{roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}<option value="member">Member</option></select>
            <select className="auth-input" aria-label="تصفية حسب اللجنة" value={filters.committee} onChange={(event) => changeFilter('committee', event.target.value)}><option value="">كل اللجان</option>{Object.values(committeeOptions).flat().map((committee) => <option key={committee.id} value={committee.id}>{committee.name}</option>)}</select>
            <select className="auth-input" aria-label="تصفية حسب الحالة" value={filters.status} onChange={(event) => changeFilter('status', event.target.value)}><option value="">كل الحالات</option><option value="active">نشط</option><option value="inactive">موقوف</option></select>
          </div>
        </div>
        {error && <p className="mb-3 text-sm text-amber-200" role="status">{error}</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm text-slate-200">
            <thead className="text-xs text-slate-400"><tr>{['الاسم','البريد','الدور','اللجنة','الحالة','تاريخ الإنشاء','الإجراءات'].map((label) => <th key={label} className="px-3 py-3">{label}</th>)}</tr></thead>
            <tbody>
              {users.map((user) => <tr key={user._id} className="border-t border-slate-700/70">
                <td className="px-3 py-3 font-semibold">{user.name}</td><td className="px-3 py-3">{user.email}</td><td className="px-3 py-3">{roleLabel(user.role)}</td><td className="px-3 py-3">{user.role === 'supervisor' ? user.committee : '—'}</td><td className="px-3 py-3">{user.isActive === false ? 'موقوف' : 'نشط'}</td><td className="px-3 py-3">{dateLabel(user.createdAt || user.joinedDate)}</td>
                <td className="px-3 py-3"><div className="flex flex-wrap gap-2"><button className="text-action" type="button" onClick={() => startEdit(user)}>تعديل</button><button className="text-action" type="button" onClick={() => setStatus(user, user.isActive === false)}>{user.isActive === false ? 'تفعيل' : 'إيقاف'}</button><button className="text-action" type="button" onClick={() => { setResetTarget(user); setResetPassword(''); }}>إعادة كلمة المرور</button></div></td>
              </tr>)}
              {!loading && users.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-400" colSpan={7}>لا توجد حسابات مطابقة.</td></tr>}
              {loading && <tr><td className="px-3 py-6 text-center text-slate-400" colSpan={7}>جارٍ تحميل الحسابات…</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>عدد النتائج: {pagination.total}</span>
          <div className="flex items-center gap-3"><button type="button" className="text-action" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>السابق</button><span>{pagination.page} / {pagination.totalPages}</span><button type="button" className="text-action" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>التالي</button></div>
        </div>
      </section>

      {resetTarget && <div className="auth-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setResetTarget(null); }}>
        <section className="auth-info-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title" dir="rtl">
          <h2 id="reset-title">إعادة كلمة مرور {resetTarget.name}</h2>
          <p>أدخل كلمة مرور مؤقتة قوية وشاركها مع المستخدم عبر قناة آمنة. لن تُعاد كلمة المرور في استجابة API.</p>
          <form className="auth-form" onSubmit={handleResetPassword}><label className="auth-field"><span>كلمة المرور الجديدة</span><input className="auth-input" type="password" required minLength={12} autoComplete="new-password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} /></label><div className="flex gap-2"><button className="app-button app-button-primary" type="submit">تغيير كلمة المرور</button><button className="app-button app-button-quiet" type="button" onClick={() => setResetTarget(null)}>إلغاء</button></div></form>
        </section>
      </div>}
    </main>
  );
}
