/**
 * Local-only manual testing server. Uses an ephemeral in-memory MongoDB and
 * disposable demo users; it never reads or connects to a configured database.
 * Run from server/: node scripts/manual-test-server.js
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'local-manual-test-only-secret';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MONGOMS_DOWNLOAD_DIR = path.join(serverRoot, 'node_modules', '.cache', 'mongodb-binaries');

const accounts = [
  { name: 'GDG Test Admin', email: 'admin@gdg.test', password: 'AdminTest2026!', role: 'head_hr', committee: 'HR' },
  { name: 'GDG Test Supervisor', email: 'supervisor@gdg.test', password: 'SupervisorTest2026!', role: 'supervisor', committee: 'OC' },
  { name: 'GDG Test Member', email: 'member@gdg.test', password: 'MemberTest2026!', role: 'member', committee: 'عام' },
];

const { MongoMemoryServer } = await import('mongodb-memory-server');
const mongo = await MongoMemoryServer.create();
process.env.MONGO_URI = mongo.getUri('gdg_manual_test');

const [{ default: connectDB }, { default: app }, { default: User }] = await Promise.all([
  import('../src/config/db.js'),
  import('../app.js'),
  import('../src/models/User.js'),
]);

await connectDB();
await User.create(accounts.filter((account) => account.role !== 'member'));

const server = app.listen(5000, '127.0.0.1', async () => {
  try {
    const member = accounts.find((account) => account.role === 'member');
    const registered = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: member.name,
        email: member.email,
        password: member.password,
        confirmPassword: member.password,
      }),
    });
    if (!registered.ok) throw new Error(`Member registration failed (${registered.status})`);

    for (const account of accounts) {
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, password: account.password }),
      });
      const result = await response.json();
      if (!response.ok || result.user?.role !== account.role) {
        throw new Error(`Login verification failed for ${account.role}`);
      }
    }

    console.log('Manual test API ready at http://localhost:5000');
    console.log('Database: disposable MongoDB memory instance; all data disappears when this process stops.');
    console.log('All three credentials were verified through /api/auth/login:');
    for (const { role, email, password } of accounts) console.log(`${role}: ${email} / ${password}`);
    console.log('Press Ctrl+C to stop the server and discard the test database.');
  } catch (error) {
    console.error(error.message);
    await shutdown(1);
  }
});

let shuttingDown = false;
async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close();
  const mongoose = (await import('mongoose')).default;
  await mongoose.connection.close();
  await mongo.stop();
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
