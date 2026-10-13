// Minimal fetch wrapper for the Express API.
// Auth uses an httpOnly cookie, so every request must send credentials.
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network failure / server unreachable
    throw new Error('تعذر الاتصال بالخادم، تأكد من تشغيل الـ Backend!');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(data?.message || 'حدث خطأ غير متوقع، حاول مرة أخرى!');
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};
