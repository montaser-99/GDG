// Display labels for the backend role enum values (backend remains authoritative).
const ROLE_LABELS = {
  head_hr: 'مسؤول الموارد البشرية (Head HR)',
  supervisor: 'مشرف اللجنة (Supervisor)',
  member: 'عضو فريق (Member)',
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || role || 'عضو فريق (Member)';
}

// Backend stores joinedDate as an ISO date string; the UI shows Arabic month/year.
export function formatJoinedDate(iso) {
  if (!iso) return 'أكتوبر 2026';
  try {
    return new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return 'أكتوبر 2026';
  }
}
