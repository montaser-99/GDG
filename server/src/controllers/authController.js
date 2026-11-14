import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { COOKIE_NAME, cookieOptions } from '../middleware/authMiddleware.js';

function setAuthCookie(res, userId, remember = true, tokenVersion = 0) {
  const options = cookieOptions();
  if (!remember) {
    // Session cookie: cleared when the browser closes.
    delete options.maxAge;
  }
  res.cookie(COOKIE_NAME, generateToken(userId, tokenVersion), options);
}

// POST /api/auth/register
export async function register(req, res, next) {
  return res.status(403).json({ message: 'Public registration is disabled. Contact an administrator.' });
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password, remember } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+password +tokenVersion');
    if (!user || !(await user.matchPassword(String(password)))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: 'This account is inactive. Contact an administrator.' });
    }

    setAuthCookie(res, user._id, remember !== false, user.tokenVersion);

    res.status(200).json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
export async function logout(req, res, next) {
  try {
    req.user.tokenVersion = Number(req.user.tokenVersion || 0) + 1;
    await req.user.save();
  } catch (error) {
    return next(error);
  }
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.status(200).json({ message: 'Logged out' });
}

// GET /api/auth/me
export async function getMe(req, res) {
  res.status(200).json({ user: req.user });
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 12) {
      return res.status(400).json({ message: 'Provide the current password and a new password of at least 12 characters' });
    }
    const user = await User.findById(req.user._id).select('+password +tokenVersion');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    user.mustChangePassword = false;
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    await user.save();
    res.json({ message: 'Password changed. Sign in again with your new password.' });
  } catch (error) {
    next(error);
  }
}
