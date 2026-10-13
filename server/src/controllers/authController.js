import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { COOKIE_NAME, cookieOptions } from '../middleware/authMiddleware.js';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function setAuthCookie(res, userId, remember = true) {
  const options = cookieOptions();
  if (!remember) {
    // Session cookie: cleared when the browser closes.
    delete options.maxAge;
  }
  res.cookie(COOKIE_NAME, generateToken(userId), options);
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword } = req.body || {}; 

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // Public registration always creates a regular member.
    // Client-supplied role/committee values are never trusted here.
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      role: 'member',
      committee: 'عام',
    });

    setAuthCookie(res, user._id);

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password, remember } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(String(password)))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    setAuthCookie(res, user._id, remember !== false);

    res.status(200).json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
export async function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.status(200).json({ message: 'Logged out' });
}

// GET /api/auth/me
export async function getMe(req, res) {
  res.status(200).json({ user: req.user });
}
