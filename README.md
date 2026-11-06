# GDG On Campus Damanhour Platform

A full-stack platform for preparing monthly committee evaluations, tracking meetings and tasks, and comparing committee performance. The React client communicates with an Express API. The API stores user accounts and evaluation reports in MongoDB through Mongoose.

## About GDG On Campus Damanhour

GDG On Campus Damanhour is the campus community represented by this project. The platform supports its committee supervisors and Head of HR with a shared monthly evaluation workflow. It is an operational reporting tool; it does not currently manage member rosters or committee assignments through an administration screen.

## Features

- Member account registration and login using an HTTP-only JWT cookie.
- Role-aware access for `head_hr`, `supervisor`, and `member` accounts.
- Monthly committee evaluation reports with meetings, attendance, tasks, scores, deliverables, challenges, warnings, and recommendations.
- MongoDB-backed report creation, retrieval, updates, and Head of HR deletion.
- Committee and month filters, plus a monthly leaderboard with rankings, summary statistics, distribution, and report insights derived from saved evaluations.
- Report copy and browser print actions.
- Responsive Arabic right-to-left interface.
- An in-memory MongoDB smoke test suite and an optional disposable manual-test server.

Registration through the public form always creates a `member`. The current application has no UI or API for promoting users, provisioning supervisors, editing a profile, or resetting a password. New privileged accounts need to be provisioned through a trusted administrative process.

## Technology stack

- Frontend: React 18, Vite 5, Tailwind CSS 3.
- Backend: Node.js, Express 4, Mongoose 8.
- Authentication: JSON Web Tokens in HTTP-only cookies; passwords hashed with bcryptjs.
- Tests: Node.js smoke tests with `mongodb-memory-server`.

## Architecture

```text
React / Vite client
  └── fetch API wrapper (cookie credentials)
        └── Express routes and middleware
              ├── Authentication controllers ── User model ── MongoDB
              └── Evaluation / leaderboard controllers ── Evaluation model ── MongoDB
```

The client and API run as separate services. The client defaults to `http://localhost:5000/api`; the API defaults to port `5000`. Leaderboard summaries are calculated from saved evaluation documents and are not stored as a separate collection. Committee names are currently defined in source code on both the client and server, while a user's assigned committee is stored on the user document.

## Project structure

```text
GDG/
├── client/
│   ├── src/components/       # Authentication, navigation, evaluation forms, profile UI
│   ├── src/context/          # Authentication and toast state
│   ├── src/data/             # Committee labels and month options
│   ├── src/pages/            # Dashboard and leaderboard
│   ├── src/utils/            # API client, calculations, labels, report formatting
│   ├── package.json
│   └── package-lock.json
├── server/
│   ├── src/config/           # MongoDB connection
│   ├── src/controllers/      # Authentication and evaluation logic
│   ├── src/data/             # Server-side committee catalogue
│   ├── src/middleware/       # Authentication, role authorization, errors
│   ├── src/models/           # Mongoose User and Evaluation models
│   ├── src/routes/           # Auth, evaluation, and leaderboard API routes
│   ├── scripts/              # Smoke tests and disposable manual test server
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## Prerequisites

- Node.js 18 or 20+ and npm (use a supported LTS release; Vite 5 supports Node 18 and Node 20+).
- A MongoDB instance reachable by the backend: local MongoDB or MongoDB Atlas.
- Git, if cloning the repository.

## Installation

Clone the repository, then install the frontend and backend dependencies separately:

```sh
git clone https://github.com/montaser-99/GDG.git
cd GDG/server
npm ci
cd ../client
npm ci
```

## Environment configuration

Create `server/.env` from `server/.env.example` and replace the placeholders with values for your local development environment. Do not commit `.env` files.

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

macOS/Linux:

```sh
cp server/.env.example server/.env
```

Configure these variables in `server/.env`:

| Variable | Required | Purpose / default |
|---|---:|---|
| `MONGO_URI` | Yes | MongoDB connection string. For local MongoDB, a development value can be `mongodb://127.0.0.1:27017/gdg_damanhour`. |
| `JWT_SECRET` | Yes | Unique random secret used to sign JWTs. Do not reuse a repository example or publish this value. |
| `PORT` | No | API port; defaults to `5000`. |
| `CLIENT_URL` | No | Exact browser origin allowed by CORS; defaults to `http://localhost:5173`. |
| `JWT_EXPIRES_IN` | No | JWT lifetime; defaults to `7d`. Use a value accepted by `jsonwebtoken`, such as `7d`. |
| `SEED_ADMIN_EMAIL` | Required by seed | Email for the initial Head of HR account. |
| `SEED_ADMIN_PASSWORD` | Required by seed | Password for the initial Head of HR account; the model requires at least 6 characters. |
| `SEED_ADMIN_NAME` | No | Display name for the seeded account; the script has a default. |
| `NODE_ENV` | No | Set to `production` in production. This enables secure, cross-site cookies and suppresses error stack traces. |

Generate a local JWT secret with Node.js:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The optional frontend variable `VITE_API_URL` is the API origin only (for example, `http://localhost:5000`); the client appends `/api`. If it is omitted, the client uses `http://localhost:5000`.

## MongoDB setup

Start a local MongoDB service or create a MongoDB Atlas database, then set `MONGO_URI` in `server/.env`. The application connects when the backend starts. Mongoose creates collections and the unique evaluation index as needed. The platform does not include a database reset command.

## Run the backend

From the `server` directory:

```sh
npm run seed
npm run dev
```

`npm run seed` creates one `head_hr` account if the configured email does not already exist; it skips an existing account. The seed script hashes the password before storing it. Keep the seed credentials private.

## Run the frontend

In a second terminal, from the `client` directory:

```sh
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The `CLIENT_URL` value in `server/.env` must match that origin exactly. There is no root script that starts both services together; run each in its own terminal.

## Optional isolated manual-test environment

To run the platform against a disposable in-memory MongoDB instead of the configured database, stop any API already listening on port `5000`, then run from `server`:

```sh
node scripts/manual-test-server.js
```

The script binds to `127.0.0.1:5000`, creates test users, verifies their login through the API, and prints the test credentials in its terminal. It does not read `server/.env` or connect to the configured MongoDB. All data disappears when the process stops. Run the client separately with `npm run dev` in `client`.

## API endpoints

All application endpoints use the `/api` prefix. Protected endpoints require the `gdg_token` HTTP-only cookie.

| Method and path | Access | Purpose |
|---|---|---|
| `GET /api/health` | Public | Health check. |
| `POST /api/auth/register` | Public | Register a member with `name`, `email`, `password`, and `confirmPassword`. Client-supplied roles are ignored. |
| `POST /api/auth/login` | Public | Authenticate with `email` and `password`; optional `remember` controls persistent-cookie behavior. |
| `POST /api/auth/logout` | Authenticated | Revoke the account's existing JWT sessions and clear the cookie. |
| `GET /api/auth/me` | Authenticated | Return the current account profile. |
| `GET /api/evaluations?committeeId=&month=` | Head of HR, assigned supervisor | List evaluations; supervisors are restricted to their assigned committee. |
| `POST /api/evaluations` | Head of HR, assigned supervisor | Create an evaluation for a known committee and month. |
| `GET /api/evaluations/months` | Head of HR, assigned supervisor | Return months that have saved evaluations. |
| `GET /api/evaluations/:id` | Head of HR, assigned supervisor | Retrieve a report; supervisors can access only their committee. |
| `PUT /api/evaluations/:id` | Head of HR, assigned supervisor | Update a report. Supervisors cannot change its committee or month. |
| `DELETE /api/evaluations/:id` | Head of HR only | Delete an evaluation. |
| `GET /api/leaderboard?month=...&type=tech\|non_tech` | Head of HR, assigned supervisor | Calculate monthly rankings, summary, distribution, and insights from saved evaluations. `type` is optional. |

## Authentication and roles

- `head_hr`: can view and manage evaluations across committees and delete reports.
- `supervisor`: can view, create, and update evaluations only for the committee assigned to the account.
- `member`: can register and access their account profile, but cannot access evaluation or leaderboard endpoints.

Passwords are hashed using bcryptjs. JWTs are sent in an HTTP-only cookie and are not stored in browser LocalStorage. Logout increments a token version on the account, invalidating all previously issued sessions for that account.

## Run backend tests

From `server`:

```sh
npm test
```

The smoke suite starts `mongodb-memory-server` and uses an isolated database; it does not use `MONGO_URI`. If the MongoDB test binary is not cached, the test dependency may need to download it. The suite covers authentication, validation, role and committee authorization, evaluation persistence and retrieval, leaderboard calculations, deletion permissions, and seed idempotency.

## Build the frontend

From `client`:

```sh
npm run build
```

Vite writes the production frontend to `client/dist/`. The backend remains a separate service and must be configured with the appropriate `CLIENT_URL`, `MONGO_URI`, and `JWT_SECRET` in the deployment environment.

## Troubleshooting

- **Backend cannot connect to MongoDB:** confirm MongoDB is running, `MONGO_URI` is valid, and the database user/network can connect.
- **`MONGO_URI` or `JWT_SECRET` missing:** create `server/.env` from the example and fill required values.
- **Browser reports a CORS error:** make `CLIENT_URL` exactly match the browser origin, including scheme and port, then restart the backend.
- **Frontend cannot reach the API:** verify the backend is listening on port `5000`, or set `VITE_API_URL` to the API origin and restart Vite.
- **Login cookie does not work in production:** serve over HTTPS and set `NODE_ENV=production`; production cookies are marked secure and use `SameSite=None`.
- **Smoke tests fail before starting MongoDB:** check whether the test MongoDB binary can be downloaded or is available in the `mongodb-memory-server` cache.
- **Registration succeeds but reports are unavailable:** public registration creates a member. A trusted administrator must provision the account's role and committee assignment.

## Future improvements

- Add secure account administration for role and committee assignment.
- Store committee definitions and membership relationships in MongoDB and expose authorized management endpoints.
- Implement profile updates and a secure password reset flow.
- Add login rate limiting and a stronger password policy.
- Add pagination for evaluation and leaderboard APIs, and report when result limits are reached.
- Add browser-level end-to-end tests for form interaction, refresh restoration, search, and error states.
- Move month values to a normalized format and share committee definitions from a single source.
