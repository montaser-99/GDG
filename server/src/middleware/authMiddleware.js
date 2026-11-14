import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const COOKIE_NAME = 'gdg_token';

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export async function protect(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(payload.id).select('+tokenVersion');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: 'This account is inactive. Contact an administrator.' });
    }
    if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
      return res.status(401).json({ message: 'Session has been revoked' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

export function requirePasswordChangeComplete(req, res, next) {
  if (req.user?.mustChangePassword) {
    return res.status(403).json({ message: 'Change your temporary password before using this resource' });
  }
  next();
}
