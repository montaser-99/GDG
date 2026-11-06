/** Smoke tests run against an in-memory MongoDB instance. */
process.env.MONGO_URI = '__MONGO_URI_SET_LATER__';
process.env.JWT_SECRET = 'smoke-test-secret-do-not-use-in-prod';
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:5173';

import { MongoMemoryServer } from 'mongodb-memory-server';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.env.MONGOMS_DOWNLOAD_DIR = path.join(serverRoot, 'node_modules', '.cache', 'mongodb-binaries');
let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, extra = '') {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    failures.push(name + (extra ? ` -- ${extra}` : ''));
    console.log(`  FAIL  ${name}${extra ? ` -- ${extra}` : ''}`);
  }
}

const json = (response) => response.json().catch(() => ({}));

async function run() {
  const mongod = await MongoMemoryServer.create();
  let server;
  try {
    const uri = mongod.getUri('gdg_smoke');
    process.env.MONGO_URI = uri;

    const { default: connectDB } = await import('../src/config/db.js');
    const { default: app } = await import('../app.js');
    const { default: User } = await import('../src/models/User.js');
    const { default: Evaluation } = await import('../src/models/Evaluation.js');
    const { computeEvaluationScore, computeAttendanceRate, computeOverallScore } = await import('../src/utils/score.js');

    await connectDB();
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const base = `http://localhost:${server.address().port}`;
    const authHeaders = (cookie) => ({ Cookie: cookie });

    console.log('\nHealth and authentication');
    const health = await json(await fetch(`${base}/api/health`));
    check('health endpoint responds', health.status === 'ok');

    const badRegister = await fetch(`${base}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid', password: '123', confirmPassword: '456' }),
    });
    check('registration validates required fields', badRegister.status === 400);

    const registerResponse = await fetch(`${base}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Member', email: 'Member@Test.com', password: 'secret1', confirmPassword: 'secret1', role: 'head_hr', committee: 'OC' }),
    });
    const registered = await json(registerResponse);
    check('public registration creates a member', registerResponse.status === 201 && registered.user?.role === 'member');
    check('registration ignores client role and committee', registered.user?.committee === 'عام');
    check('registration never returns a password', !('password' in (registered.user || {})));
    check('registration uses an HttpOnly cookie', /HttpOnly/i.test(registerResponse.headers.get('set-cookie') || ''));

    const duplicateRegistration = await fetch(`${base}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Duplicate Member', email: 'member@test.com', password: 'secret1', confirmPassword: 'secret1' }),
    });
    check('duplicate registration is rejected', duplicateRegistration.status === 409);

    const badLogin = await fetch(`${base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@test.com', password: 'wrong-password' }),
    });
    check('incorrect password is rejected', badLogin.status === 401);

    const noAuth = await fetch(`${base}/api/auth/me`);
    check('session endpoint rejects unauthenticated requests', noAuth.status === 401);

    const memberLogin = await fetch(`${base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@test.com', password: 'secret1' }),
    });
    const memberCookie = (memberLogin.headers.get('set-cookie') || '').split(';')[0];
    check('member can log in', memberLogin.status === 200 && Boolean(memberCookie));

    const memberMeResponse = await fetch(`${base}/api/auth/me`, { headers: authHeaders(memberCookie) });
    const memberMe = await json(memberMeResponse);
    check('authenticated profile endpoint returns persisted account without password', memberMeResponse.status === 200 && memberMe.user?.email === 'member@test.com' && !('password' in (memberMe.user || {})));

    const rawMember = await User.findOne({ email: 'member@test.com' }).select('+password').lean();
    check('password is stored hashed', rawMember?.password?.startsWith('$2') === true);

    const jsonwebtoken = (await import('jsonwebtoken')).default;
    const expiredToken = jsonwebtoken.sign({ id: String(rawMember._id) }, process.env.JWT_SECRET, { expiresIn: -1 });
    const expiredSession = await fetch(`${base}/api/auth/me`, { headers: authHeaders(`gdg_token=${expiredToken}`) });
    check('expired JWT is rejected', expiredSession.status === 401);


    await User.create({ name: 'HR Admin', email: 'hr@test.com', password: 'AdminPass1!', role: 'head_hr', committee: 'HR' });
    await User.create({ name: 'OC Supervisor', email: 'supervisor@test.com', password: 'Supervisor1!', role: 'supervisor', committee: 'OC' });
    await User.create({ name: 'Flutter Supervisor', email: 'flutter@test.com', password: 'FlutterPass1!', role: 'supervisor', committee: 'Flutter' });

    const loginCookie = async (email, password) => {
      const response = await fetch(`${base}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return (response.headers.get('set-cookie') || '').split(';')[0];
    };
    const adminCookie = await loginCookie('hr@test.com', 'AdminPass1!');
    const supervisorCookie = await loginCookie('supervisor@test.com', 'Supervisor1!');
    const otherSupervisorCookie = await loginCookie('flutter@test.com', 'FlutterPass1!');

    console.log('\nAuthorization and evaluation workflows');
    check('member role cannot read evaluations', (await fetch(`${base}/api/evaluations`, { headers: authHeaders(memberCookie) })).status === 403);
    check('member role cannot read leaderboard', (await fetch(`${base}/api/leaderboard?month=November%202026`, { headers: authHeaders(memberCookie) })).status === 403);
    check('unauthenticated user cannot read evaluations', (await fetch(`${base}/api/evaluations`)).status === 401);

    const logoutResponse = await fetch(`${base}/api/auth/logout`, {
      method: 'POST', headers: authHeaders(memberCookie),
    });
    const afterLogout = await fetch(`${base}/api/auth/me`, { headers: authHeaders(memberCookie) });
    check('logout clears the session cookie', logoutResponse.status === 200 && /gdg_token=;/i.test(logoutResponse.headers.get('set-cookie') || ''));
    check('logged-out cookie cannot restore a session', afterLogout.status === 401);

    const invalidEvaluation = await fetch(`${base}/api/evaluations`, {
      method: 'POST', headers: { ...authHeaders(adminCookie), 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: 'November 2026', committeeId: 'not-a-committee', committeeType: 'non_tech' }),
    });
    check('unknown committee is rejected by backend validation', invalidEvaluation.status === 400);

    const month = 'November 2026';
    const evaluationBody = {
      month,
      committeeId: 'OC',
      committeeType: 'non_tech',
      supervisor: 'Forged supervisor',
      target: 'Community chapter',
      commScore: 80,
      deadlineScore: 90,
      attendanceNotes: 'Attendance note',
      challenges: 'Scheduling challenge',
      solutions: 'Reassigned work',
      deliverables: 'Published event plan',
      meetings: [
        { title: 'Planning', duration: '1 hour', attendance: 10, absence: 2, notes: '' },
        { title: 'Negative count probe', attendance: -4, absence: -3, notes: '' },
      ],
      tasks: [{ text: 'Publish the event plan', assigned: 'OC team', status: 'completed' }],
      bestMember: 'Member A',
      warnings: 'Follow up next month',
      filteration: 'No members flagged',
      generalRecs: 'Keep the weekly check-in',
      savedAt: '1970-01-01T00:00:00.000Z',
    };
    const createdResponse = await fetch(`${base}/api/evaluations`, {
      method: 'POST', headers: { ...authHeaders(adminCookie), 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluationBody),
    });
    const created = await json(createdResponse);
    check('head HR can create a persisted evaluation', createdResponse.status === 201 && Boolean(created.evaluation?._id));
    const evaluationId = created.evaluation?._id;
    const persistedEvaluation = await Evaluation.findById(evaluationId).lean();
    check('created evaluation exists in MongoDB with nested tasks', persistedEvaluation?.tasks?.[0]?.assignee === 'OC team' && persistedEvaluation?.tasks?.[0]?.status === 'completed');
    check('negative attendance counts are normalized and client timestamps are ignored', persistedEvaluation?.meetings?.[1]?.attendance === 0 && persistedEvaluation?.meetings?.[1]?.absence === 0 && persistedEvaluation?.savedAt?.getFullYear() > 2020);

    const duplicateResponse = await fetch(`${base}/api/evaluations`, {
      method: 'POST', headers: { ...authHeaders(adminCookie), 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluationBody),
    });
    check('duplicate committee-month evaluation is rejected', duplicateResponse.status === 409);

    const supervisorRead = await fetch(`${base}/api/evaluations?committeeId=OC&month=${encodeURIComponent(month)}`, { headers: authHeaders(supervisorCookie) });
    const supervisorResults = await json(supervisorRead);
    check('supervisor can read their assigned committee', supervisorRead.status === 200 && supervisorResults.evaluations?.length === 1);

    const foreignRead = await fetch(`${base}/api/evaluations?committeeId=Flutter&month=${encodeURIComponent(month)}`, { headers: authHeaders(supervisorCookie) });
    check('supervisor cannot query a different committee', foreignRead.status === 403);

    const foreignCreate = await fetch(`${base}/api/evaluations`, {
      method: 'POST', headers: { ...authHeaders(supervisorCookie), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...evaluationBody, committeeId: 'Flutter', committeeType: 'tech' }),
    });
    check('supervisor cannot create for a different committee', foreignCreate.status === 403);

    const foreignDetail = await fetch(`${base}/api/evaluations/${evaluationId}`, { headers: authHeaders(otherSupervisorCookie) });
    check('supervisor cannot read another committee by record ID', foreignDetail.status === 403);

    const updateResponse = await fetch(`${base}/api/evaluations/${evaluationId}`, {
      method: 'PUT', headers: { ...authHeaders(supervisorCookie), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...evaluationBody, committeeId: 'Flutter', month: 'December 2026', commScore: 88 }),
    });
    const updated = await json(updateResponse);
    check('supervisor can update their report', updateResponse.status === 200 && updated.evaluation?.commScore === 88);
    check('report identity cannot be changed by update', updated.evaluation?.committeeId === 'OC' && updated.evaluation?.month === month);
    check('supervisor identity is taken from the session', updated.evaluation?.supervisor === 'OC Supervisor');

    const adminRelogin = await fetch(`${base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hr@test.com', password: 'AdminPass1!' }),
    });
    const reloginCookie = (adminRelogin.headers.get('set-cookie') || '').split(';')[0];
    const fetchedAfterRelogin = await fetch(`${base}/api/evaluations/${evaluationId}`, { headers: authHeaders(reloginCookie) });
    const fetchedEvaluation = await json(fetchedAfterRelogin);
    check('updated evaluation survives a new login session', adminRelogin.status === 200 && fetchedAfterRelogin.status === 200 && fetchedEvaluation.evaluation?.commScore === 88);
    check('report text fields survive persistence and retrieval', fetchedEvaluation.evaluation?.target === 'Community chapter' && fetchedEvaluation.evaluation?.challenges === 'Scheduling challenge' && fetchedEvaluation.evaluation?.solutions === 'Reassigned work' && fetchedEvaluation.evaluation?.deliverables === 'Published event plan' && fetchedEvaluation.evaluation?.generalRecs === 'Keep the weekly check-in');

    console.log('\nLeaderboard and score calculations');
    const boardResponse = await fetch(`${base}/api/leaderboard?month=${encodeURIComponent(month)}`, { headers: authHeaders(adminCookie) });
    const board = await json(boardResponse);
    check('leaderboard uses saved evaluations and returns summary', boardResponse.status === 200 && board.summary?.totalCommittees === 1);
    check('leaderboard includes ranking and distribution', board.rankings?.[0]?.committeeId === 'OC' && board.distribution?.veryGood === 1);
    check('leaderboard insights derive saved member and warning details', board.insights?.bestMembers?.[0]?.bestMember === 'Member A' && board.insights?.warnings?.[0]?.warnings === 'Follow up next month');

    const typedBoard = await json(await fetch(`${base}/api/leaderboard?month=${encodeURIComponent(month)}&type=tech`, { headers: authHeaders(adminCookie) }));
    check('leaderboard type filter excludes nonmatching saved reports', typedBoard.rankings?.length === 0 && typedBoard.type === 'tech');
    check('leaderboard rejects unsupported type filters', (await fetch(`${base}/api/leaderboard?month=${encodeURIComponent(month)}&type=invalid`, { headers: authHeaders(adminCookie) })).status === 400);
    check('leaderboard requires a month', (await fetch(`${base}/api/leaderboard`, { headers: authHeaders(adminCookie) })).status === 400);

    const supervisorBoardResponse = await fetch(`${base}/api/leaderboard?month=${encodeURIComponent(month)}`, { headers: authHeaders(supervisorCookie) });
    const supervisorBoard = await json(supervisorBoardResponse);
    check('supervisor leaderboard is limited to their committee', supervisorBoardResponse.status === 200 && supervisorBoard.rankings?.every((item) => item.committeeId === 'OC'));

    const monthsResponse = await fetch(`${base}/api/evaluations/months`, { headers: authHeaders(adminCookie) });
    const months = await json(monthsResponse);
    check('month selector options come from persisted reports', months.months?.includes(month));

    check('zero meetings return full attendance by existing scoring rules', computeAttendanceRate([]) === 100);
    check('attendance is rounded from meeting totals', computeAttendanceRate([{ attendance: 10, absence: 2 }]) === 83);
    check('overall score follows the existing weighted formula', computeOverallScore(83, 80, 90) === 84);
    const score = computeEvaluationScore({ meetings: [{ attendance: 10, absence: 2 }], commScore: 80, deadlineScore: 90 });
    check('evaluation score returns both computed metrics', score.attendanceRate === 83 && score.overallScore === 84);

    const supervisorDelete = await fetch(`${base}/api/evaluations/${evaluationId}`, { method: 'DELETE', headers: authHeaders(supervisorCookie) });
    check('supervisor cannot delete a report', supervisorDelete.status === 403);
    const adminDelete = await fetch(`${base}/api/evaluations/${evaluationId}`, { method: 'DELETE', headers: authHeaders(adminCookie) });
    check('head HR can delete a report in the isolated test database', adminDelete.status === 200);
    check('deleted report is no longer retrievable', (await fetch(`${base}/api/evaluations/${evaluationId}`, { headers: authHeaders(adminCookie) })).status === 404);

    console.log('\nSeed idempotency');
    const runSeed = () => new Promise((resolve, reject) => {
      execFile(process.execPath, ['seed.js'], {
        cwd: serverRoot,
        env: {
          ...process.env,
          MONGO_URI: uri,
          JWT_SECRET: 'smoke-test-secret-do-not-use-in-prod',
          SEED_ADMIN_EMAIL: 'seed-admin@gdg.test',
          SEED_ADMIN_PASSWORD: 'SeedPass123!',
        },
      }, (error, stdout, stderr) => error ? reject(new Error(stderr || stdout || error.message)) : resolve(stdout));
    });
    const firstSeed = await runSeed();
    check('seed creates the first head HR account', /Seed complete/.test(firstSeed));
    const secondSeed = await runSeed();
    check('seed is idempotent', /Seed skipped/.test(secondSeed));
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    const mongoose = (await import('mongoose')).default;
    await mongoose.connection.close();
    await mongod.stop();
  }

  console.log(`\nSmoke tests: ${passed} passed, ${failed} failed`);
  if (failed) {
    failures.forEach((failure) => console.log(`  - ${failure}`));
    process.exitCode = 1;
  }
  process.exit(process.exitCode || 0);
}

run().catch((error) => {
  console.error('Smoke test crashed:', error);
  process.exit(1);
});
