import 'dotenv/config';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

const seed = async () => {
  const email = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '';

  if (!email || !password) {
    throw new Error('Seed aborted: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required.');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Seed aborted: SEED_ADMIN_EMAIL is not a valid email address.');
  }
  if (password.length < 6) {
    throw new Error('Seed aborted: SEED_ADMIN_PASSWORD must be at least 6 characters long (matches User model validation).');
  }

  await connectDB(); 

  const exists = await User.findOne({ email });
  if (exists) {
    console.log(`Seed skipped: a user with email ${email} already exists.`);
    return;
  }

  const name = (process.env.SEED_ADMIN_NAME || 'مسؤول الموارد البشرية').trim();
  await User.create({
    name,
    email,
    password, // pre-save hook hashes it automatically
    role: 'head_hr',
    committee: 'HR',
  });

  console.log(`Seed complete: head_hr user "${name}" <${email}> created (password hashed, not displayed).`);
};

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = (await import('mongoose')).default;
    await mongoose.connection.close();
  });
