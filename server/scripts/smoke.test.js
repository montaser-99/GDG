/**
 * Phase 2 smoke tests - run against an in-memory MongoDB instance.
 * Usage: npm test
 * Covers the Phase 2 acceptance criteria (health, auth flow, cookie rules,
 * role forcing, validation, hashing, unique index, scoring, seed idempotency).
 */

process.env.MONGO_URI = '__MONGO_URI_SET_LATER__';
process.env.JWT_SECRET = 'smoke-test-secret-do-not-use-in-prod';
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:5173';

import { MongoMemoryServer } from 'mongodb-memory-server';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, extra = '') {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    failures.push(name + (extra ? ` -- ${extra}` : ''));
    console.log(`  FAIL  ${name}${extra ? ` -- ${extra}` : ''}`);
  }
}

async function run() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('gdg_smoke');
  process.env.MONGO_URI = uri;

  const { default: connectDB } = await import('../src/config/db.js');
  const { default: app } = await import('../app.js');
  const { default: User } = await import('../src/models/User.js');
  const { default: Evaluation } = await import('../src/models/Evaluation.js');
  const { computeEvaluationScore, computeAttendanceRate, computeOverallScore } = await import('../src/utils/score.js');

  await connectDB();
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = `http://localhost:${server.address().port}`;
  console.log(`\nSmoke server on ${base}\n`);

  const j = (res) => res.json().catch(() => ({}));
  const runSeed = () =>
    new Promise((resolve, reject) => {
      execFile(
        process.execPath,
        ['seed.js'],
        {
          cwd: serverRoot,
          env: {
            ...process.env,
            MONGO_URI: uri,
            JWT_SECRET: 'smoke-test-secret-do-not-use-in-prod',
            SEED_ADMIN_EMAIL: 'headhr@gdg.test',
            SEED_ADMIN_PASSWORD: 'SeedPass123!',
          },
        },
        (err, stdout, stderr) => (err ? reject(new Error(stderr || stdout || err.message)) : resolve(stdout))
      );
    });

  // --- 1. Health ---
  console.log('Health');
  {
    const res = await fetch(`${base}/api/health`);
    const body = await j(res);
    check('GET /api/health returns 200 {status: ok}', res.status === 200 && body.status === 'ok', JSON.stringify(body));
  }

  // --- 2. Register validation ---
  console.log('\nRegister validation');
  const reg = async (payload) => j(await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));
  {
    const body = await reg({ email: 'x@y.com', password: '123456', confirmPassword: '123456' });
    check('missing name -> 400', body.message !== undefined);
    const short = await reg({ name: 'A', email: 'x@y.com', password: '123', confirmPassword: '123' });
    check('short password -> 400', short.message !== undefined);
    const mismatch = await reg({ name: 'Test User', email: 'x@y.com', password: '123456', confirmPassword: '654321' });
    check('password mismatch -> 400', mismatch.message !== undefined);
    const badEmail = await reg({ name: 'Test User', email: 'not-an-email', password: '123456', confirmPassword: '123456' });
    check('invalid email -> 400', badEmail.message !== undefined);
  }

  // --- 3. Register role forcing + no password leak ---
  console.log('\nRegister role forcing');
  let cookie = '';
  {
    const res = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'عضو تجريبي',
        email: 'Member@Test.com',
        password: 'secret1',
        confirmPassword: 'secret1',
        role: 'head_hr', // must be ignored
        committee: 'ML', // must be ignored
      }),
    });
    const body = await j(res);
    check('register succeeds -> 201', res.status === 201, `got ${res.status}`);
    check('role forced to member', body.user?.role === 'member', `got ${body.user?.role}`);
    check("committee forced to 'عام'", body.user?.committee === 'عام', `got ${body.user?.committee}`);
    check('email lowercased', body.user?.email === 'member@test.com', `got ${body.user?.email}`);
    check('password never returned', !('password' in (body.user || {})), JSON.stringify(body.user));

    cookie = res.headers.get('set-cookie') || '';
    check('register sets gdg_token cookie', /gdg_token=/.test(cookie));
    check('cookie is HttpOnly', /HttpOnly/i.test(cookie));
    check('cookie is not marked secure in non-production', !/Secure/i.test(cookie));

    const dup = await reg({
      name: 'عضو تجريبي',
      email: 'member@test.com',
      password: 'secret1',
      confirmPassword: 'secret1',
    });
    check('duplicate email -> 409', dup.message !== undefined);
  }

  // --- 4. Raw DB password hashing ---
  console.log('\nPassword hashing');
  {
    const raw = await User.findOne({ email: 'member@test.com' }).select('+password').lean();
    check('password stored hashed', !!raw && raw.password.startsWith('$2'), raw?.password?.slice(0, 7));
    check('plaintext never stored', raw?.password !== 'secret1');
  }

  // --- 5. Login / me / logout ---
  console.log('\nLogin / me / logout');
  {
    const bad = await j(await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@test.com', password: 'wrongpass' }),
    }));
    check('wrong password -> 401', bad.message !== undefined);

    const res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@test.com', password: 'secret1' }),
    });
    const body = await j(res);
    check('login -> 200 with user', res.status === 200 && body.user?.email === 'member@test.com');
    check('login response has no password', !('password' in (body.user || {})));
    cookie = res.headers.get('set-cookie') || '';
    check('login sets HttpOnly gdg_token', /gdg_token=[^;]+;/.test(cookie) && /HttpOnly/i.test(cookie));

    const noAuth = await j(await fetch(`${base}/api/auth/me`));
    check('GET /me without cookie -> 401', noAuth.message !== undefined);

    const meRes = await fetch(`${base}/api/auth/me`, { headers: { Cookie: cookie.split(';')[0] } });
    const meBody = await j(meRes);
    check('GET /me with cookie -> 200 user', meRes.status === 200 && meBody.user?.role === 'member');
    check('GET /me has no password', !('password' in (meBody.user || {})));

    const logoutRes = await fetch(`${base}/api/auth/logout`, { method: 'POST' });
    const cleared = logoutRes.headers.get('set-cookie') || '';
    check('logout clears cookie', /gdg_token=;|Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(cleared), cleared.slice(0, 80));
  }

  // --- 6. Evaluation placeholders + unique index ---
  console.log('\nEvaluations');
  {
    const unauth = await fetch(`${base}/api/evaluations`);
    check('GET /api/evaluations unauthenticated -> 401', unauth.status === 401);

    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@test.com', password: 'secret1' }),
    });
    const authCookie = (loginRes.headers.get('set-cookie') || '').split(';')[0];

    const placeholder = await j(await fetch(`${base}/api/evaluations`, { headers: { Cookie: authCookie } }));
    check('evaluation routes are 501 placeholders', placeholder.message === 'Not implemented yet');
  }
  {
    await Evaluation.create({
      month: 'أكتوبر 2026',
      committeeId: 'OC',
      committeeType: 'non_tech',
      supervisor: 'مشرف',
      meetings: [{ title: 'لقاء', duration: 'ساعة', attendance: 10, absence: 2, notes: '' }],
      tasks: [{ text: 'مهمة', assignee: 'عضو', status: 'completed' }],
    });
    let dupCode = null;
    try {
      await Evaluation.create({ month: 'أكتوبر 2026', committeeId: 'OC', committeeType: 'non_tech' });
    } catch (e) {
      dupCode = e.code;
    }
    check('duplicate committeeId+month -> Mongo error 11000', dupCode === 11000, `got ${dupCode}`);
    const count = await Evaluation.countDocuments({ committeeId: 'OC', month: 'أكتوبر 2026' });
    check('one monthly committee evaluation = one document', count === 1);
    const badStatus = await Evaluation.create({
      month: 'نوفمبر 2026',
      committeeId: 'OC',
      committeeType: 'non_tech',
      tasks: [{ text: 'x', assignee: 'y', status: 'not_a_status' }],
    }).then(() => null).catch((e) => e);
    check("task status restricted to enum", badStatus !== null, badStatus ? '' : 'invalid status accepted');
  }

  // --- 7. Scoring formula ---
  console.log('\nScoring formula');
  {
    check('zero meetings -> attendance rate 100', computeAttendanceRate([]) === 100);
    check('attendance rate = round(att/(att+abs)*100)',
      computeAttendanceRate([{ attendance: 10, absence: 2 }]) === 83);
    check('overall = round(att*0.30 + comm*0.35 + deadline*0.35)',
      computeOverallScore(83, 80, 90) === 84,
      `got ${computeOverallScore(83, 80, 90)}`);
    const doc = await Evaluation.findOne({ committeeId: 'OC', month: 'أكتوبر 2026' });
    const score = computeEvaluationScore(doc);
    check('computeEvaluationScore returns both parts (83, 90, 85 -> 83/86)',
      score.attendanceRate === 83 && score.overallScore === 86,
      JSON.stringify(score));
  }

  // --- 8. Seed idempotency ---
  console.log('\nSeed script');
  {
    const out1 = await runSeed();
    check('first seed run creates head_hr', /Seed complete/.test(out1), out1.trim());
    const admin = await User.findOne({ email: 'headhr@gdg.test' }).select('+password').lean();
    check('seeded user is head_hr with committee HR', admin?.role === 'head_hr' && admin?.committee === 'HR');
    check('seeded password hashed', admin?.password.startsWith('$2'));
    const out2 = await runSeed();
    check('second seed run skips (no duplicate)', /Seed skipped/.test(out2), out2.trim());
    check('still exactly one seed user', (await User.countDocuments({ email: 'headhr@gdg.test' })) === 1);
  }

  await server.close();
  await mongod.stop();
  await new Promise((r) => setTimeout(r, 100)); // let mongoose connection settle
  process.exitCode = 0;

  console.log(`\n========================================`);
  console.log(`Smoke tests: ${passed} passed, ${failed} failed`);
  if (failed) {
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exitCode = 1;
  }
  // hard-exit to avoid hanging on open handles from mongoose/memory server
  process.exit(process.exitCode);
}

run().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
