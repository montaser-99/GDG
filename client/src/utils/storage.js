// ==========================================
// LOCAL STORAGE LAYER (temporary, client-side)
// This module is the single place that touches localStorage/sessionStorage.
// It will be replaced by API calls in the backend phase.
// ==========================================

const EVALUATIONS_STORE_KEY = 'gdg_damanhour_evaluations';
const USERS_KEY = 'gdg_damanhour_users';
const CURRENT_USER_KEY = 'gdg_damanhour_current_user';

// ---------- Evaluations ----------

export function getEvaluationKey(month, committeeId) {
  return `${month}_${committeeId}`;
}

export function getAllEvaluations() {
  try {
    return JSON.parse(localStorage.getItem(EVALUATIONS_STORE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

export function getEvaluation(key) {
  return getAllEvaluations()[key] || null;
}

export function saveEvaluation(key, data) {
  const all = getAllEvaluations();
  all[key] = data;
  localStorage.setItem(EVALUATIONS_STORE_KEY, JSON.stringify(all));
}

// ---------- Users ----------

function seedDefaultUsers() {
  const existing = localStorage.getItem(USERS_KEY);
  if (!existing) {
    const defaultUsers = [
      {
        id: 'user_1',
        name: 'ضياء عبدالله',
        email: 'diaa@gdg.com',
        password: '123456',
        role: 'Head HR',
        committee: 'HR',
        joinedDate: 'أكتوبر 2026',
      },
      {
        id: 'user_2',
        name: 'مشرف تجريبي (Supervisor)',
        email: 'supervisor@gdg.com',
        password: '123456',
        role: 'Supervisor',
        committee: 'Flutter',
        joinedDate: 'أكتوبر 2026',
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
}

export function getAllUsers() {
  seedDefaultUsers();
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

export function saveAllUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ---------- Current session ----------

export function getCurrentUser() {
  const stored = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function setCurrentUser(user, remember = true) {
  if (remember) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    sessionStorage.removeItem(CURRENT_USER_KEY);
  } else {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
}
