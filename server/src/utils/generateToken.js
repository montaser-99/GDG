import jwt from 'jsonwebtoken';

export default function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Set it in server/.env (see .env.example).');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
