# School Management System API

REST API for a small school: staff and student accounts, classes, subjects, timetable, attendance, assignments, monthly results, and subject-drop requests. The demo dataset is **Willowmere Academy**, a fictional school. No real people or institutions are included.

The matching React / Vite / MUI client lives in [SMS_Frontend](https://github.com/hassan2314/SMS_Frontend).

## Features

- Email and password login with a short-lived JWT and an httpOnly refresh cookie
- Roles: `ADMIN`, `TEACHER`, `STUDENT`
- Classes, subject assignments, and a weekly timetable
- Attendance (`PRESENT`, `ABSENT`, `LEAVE`) and per-student percentages
- Assignments, submissions, and grades
- Monthly subject results
- Teachers can request to drop a subject; an admin approves or rejects it
- Admin counts for users, attendance, assignments, and results

There is no fees or billing model in the schema, so the API does not expose one.

## Stack

- Node.js 22 (ES modules), Express 5
- Prisma 6 and PostgreSQL
- JWT (`jsonwebtoken`) and `bcryptjs`
- `cors` and `cookie-parser`

## Architecture

HTTP JSON hits Express routes in `src/app.js`, controllers validate and shape the response, services talk to a single Prisma client, and Prisma talks to PostgreSQL.

Locally and on Render, `src/index.js` calls `listen`. On Vercel it does not: `api/index.js` exports the same app, and `vercel.json` rewrites `/`, `/health`, and `/api/v1/*` to that function.

Access tokens travel in `Authorization: Bearer <token>`. Refresh tokens travel in an httpOnly cookie named `refreshToken`. In production that cookie is `Secure` and `SameSite=None`, so a frontend on another host can send it. Successful JSON bodies use `{ success, statusCode, message, data }`.

The Prisma schema and migrations are at `src/db/prisma/prisma/`. The app uses `DATABASE_URL`. Migrations use `directUrl` (`DATABASE_URL_UNPOOLED`). Local commands copy `DATABASE_URL` into `DATABASE_URL_UNPOOLED` when you only set one of them.

## API overview

Base path: `/api/v1`. `GET /health` is outside that prefix and does not touch the database.

| Method | Path | Who |
| --- | --- | --- |
| GET | `/health` | Public. Liveness only. |
| GET | `/` | Public. Service name and links. |
| POST | `/users/register` | Public. Body: `name`, `email`, `password`, `dob`, `role`. `role` is `TEACHER` or `STUDENT`. |
| POST | `/users/login` | Public. Body: `email`, `password`. Returns `accessToken` and `user`. |
| POST | `/users/refresh-token` | Refresh cookie. Returns a new access token. |
| POST | `/users/logout` | Bearer |
| PUT | `/users/update` | Bearer. Body: `name`, `dob`. |
| PUT | `/users/change-password` | Bearer. Body: `previousPassword`, `password`. |
| DELETE | `/users/delete` | Bearer. Deletes the signed-in user. |
| GET | `/users/users` | Admin |
| DELETE | `/users/delete/:id` | Admin |
| GET | `/users/:id` | Public profile fields |
| GET | `/admin/users` | Admin |
| DELETE | `/admin/users/:id` | Admin |
| PUT | `/admin/users/:id/role` | Admin. Body: `role`. |
| GET | `/admin/users/:id` | Admin detail |
| GET | `/admin/user-role-stats` | Admin |
| GET | `/admin/overview-stats` | Admin |
| GET | `/admin/assignment-stats` | Admin |
| GET | `/admin/attendance-summary` | Admin |
| GET | `/admin/stats/monthly-results` | Admin |
| GET | `/classes` | Bearer |
| POST | `/classes` | Admin. Body: `name`. |
| GET | `/classes/:id` | Bearer |
| PUT | `/classes/:id` | Admin |
| DELETE | `/classes/:id` | Admin |
| GET | `/teachers` | Bearer |
| GET | `/teachers/class/:classId` | Bearer |
| GET | `/teachers/:id` | Admin or teacher |
| POST | `/teachers/assign-class` | Admin or teacher |
| PUT | `/teachers/:studentId/update-class` | Admin or teacher |
| GET | `/students` | Public list |
| GET | `/students/:id` | Bearer |
| POST | `/subjects` | Admin. Body: `name`, `classId`, `teacherId`. |
| GET | `/subjects` | Bearer |
| GET | `/subjects/class/:classId` | Bearer |
| GET | `/subjects/teacher/:teacherId` | Bearer |
| GET | `/subjects/:id` | Bearer |
| PUT | `/subjects/:id` | Admin |
| DELETE | `/subjects/:id` | Admin |
| POST | `/subjectDrops` | Admin or teacher |
| GET | `/subjectDrops/my` | Admin or teacher |
| GET | `/subjectDrops` | Admin |
| GET | `/subjectDrops/:id` | Admin |
| PUT | `/subjectDrops/:id` | Admin. Updates status. |
| POST | `/timetable` | Admin |
| GET | `/timetable` | Bearer |
| GET | `/timetable/class/:classId` | Bearer |
| GET | `/timetable/student/:studentId` | Bearer |
| GET | `/timetable/teacher/:teacherId` | Admin or teacher |
| GET | `/timetable/by-day` | Bearer |
| PUT | `/timetable/:id` | Admin |
| DELETE | `/timetable/:id` | Admin |
| POST | `/attendances/mark` | Admin or teacher. Body: `studentId`, `subjectId`, `date`, `status`. |
| GET | `/attendances/class/:classId` | Admin or teacher. Query: `date`. |
| GET | `/attendances/subject/:subjectId` | Admin or teacher |
| GET | `/attendances/:id` | Bearer. Student attendance percentage. |
| POST | `/assignments` | Admin or teacher. Body: `title`, `description`, `dueDate`, `classId`, `subjectId`, `teacherId`. |
| GET | `/assignments/class/:classId` | Bearer |
| GET | `/assignments/subject/:subjectId` | Bearer |
| GET | `/assignments/teacher/:teacherId` | Bearer |
| DELETE | `/assignments/:id` | Admin or teacher |
| POST | `/assignmentSubmissions` | Bearer |
| GET | `/assignmentSubmissions/assignment/:assignmentId` | Bearer |
| GET | `/assignmentSubmissions/student/:studentId` | Bearer |
| PATCH | `/assignmentSubmissions/grade/:submissionId` | Admin or teacher |
| POST | `/monthlyResults` | Admin or teacher. Body: `studentId`, `subjectId`, `month`, `marks`, `totalMarks`, `remarks`. |
| PUT | `/monthlyResults/:id` | Admin or teacher |
| GET | `/monthlyResults/student/:studentId` | Bearer |
| GET | `/monthlyResults/month/:month` | Bearer. Example month: `2026-10`. |
| GET | `/monthlyResults/class/:classId` | Bearer |

Send `Content-Type: application/json`. Dates are ISO strings.

## Demo logins

Created by `npm run db:seed`. These passwords are obviously for the demo. Change them if you expose the API beyond a portfolio.

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| Admin | Avery Quinn | `admin@sms.example.com` | `DemoAdmin123!` |
| Teacher | Jordan Hale | `teacher@sms.example.com` | `DemoTeacher123!` |
| Student | Samira Cole (Grade 10) | `student@sms.example.com` | `DemoStudent123!` |

Other fictional staff, same teacher password:

| Name | Email | Teaches |
| --- | --- | --- |
| Riley Okonkwo | `riley.okonkwo@sms.example.com` | English |
| Morgan Ellis | `morgan.ellis@sms.example.com` | Computer Studies, History, World History |

Other fictional students, same student password:

| Name | Email | Class |
| --- | --- | --- |
| Theo Marchand | `theo.marchand@sms.example.com` | Grade 10 |
| Priya Nandakumar | `priya.nandakumar@sms.example.com` | Grade 10 |
| Leo Ferreira | `leo.ferreira@sms.example.com` | Grade 9 |
| Hana Sato | `hana.sato@sms.example.com` | Grade 9 |
| Omar Haddad | `omar.haddad@sms.example.com` | Grade 9 |
| Mina Berg | `mina.berg@sms.example.com` | Grade 8 |
| Caleb Ortiz | `caleb.ortiz@sms.example.com` | Grade 8 |

The seed also loads three classes (Grade 8, 9, and 10), subjects, a week of timetable rows, a week of Grade 10 attendance, three assignments with submissions, September and October 2026 results, and two subject-drop requests (one pending, one rejected).

Running the seed again replaces those demo accounts and the fixed Willowmere classes. Accounts with any other email stay. Rows that reference the demo classes, subjects, teachers, or students are removed and then inserted again. Details are at the top of `src/db/prisma/prisma/seed.js`.

Public registration cannot create an `ADMIN`. Promote someone later with `PUT /api/v1/admin/users/:id/role` while signed in as Avery.

## Local setup

Requirements: Node.js 22, and a Postgres database (local Postgres or the free Neon database from the deploy steps). You only need `DATABASE_URL`. Leave `DATABASE_URL_UNPOOLED` unset unless you already have a separate direct URL.

```bash
git clone https://github.com/hassan2314/SMS_Backend.git
cd SMS_Backend
cp .env.example .env
# Put your Postgres URL and two random secrets in .env
npm install
npm run db:setup
npm run dev
```

- API: `http://localhost:4000/api/v1`
- Health: `http://localhost:4000/health`
- Frontend dev server expected by default CORS: `http://localhost:5173`

`npm run db:setup` applies the existing migrations (`prisma migrate deploy`) and runs the seed. Use `npm run dev` day to day. `npm start` is the production process.

## Environment variables

Names only. Copy `.env.example` and replace the placeholders. Do not commit `.env`.

| Name | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres URL used by the running API. On Vercel this is the pooled Neon URL injected by the marketplace integration. Locally it is your own Postgres URL. Include `sslmode=require` for Neon. |
| `DATABASE_URL_UNPOOLED` | On Vercel | Direct Neon URL. Prisma uses it as `directUrl` so `migrate deploy` does not go through the pooler. The Vercel Neon integration injects it. Locally you can omit it; scripts copy `DATABASE_URL` into it. |
| `ACCESS_TOKEN_SECRET` | Yes | Signs access tokens. Long random string. |
| `REFRESH_TOKEN_SECRET` | Yes | Signs refresh tokens. A different long random string. |
| `CLIENT_URL` | Yes in production | Allowed browser origins, comma-separated, no trailing slash. Example: `https://your-app.vercel.app,http://localhost:5173`. Defaults to `http://localhost:5173`. |
| `PORT` | No | Listen port for `npm run dev` / `npm start`. Defaults to `4000`. Vercel does not use it. |
| `NODE_ENV` | No | Vercel sets `production`. That enables `Secure` and `SameSite=None` on the refresh cookie so a frontend on another host can send it. |
| `RUN_MIGRATIONS` | No | Long-running hosts only (`npm start`). `true` runs `prisma migrate deploy` in the background after listen. Ignored on Vercel, where migrate runs in the build. |
| `MIGRATE_TIMEOUT_MS` | No | How long that background migrate may run. Default `60000`. Ignored on Vercel. |

A shell `DATABASE_URL` wins over `.env`, which is how you seed a hosted database without editing the local file.

The server adds `connect_timeout=15` and `pool_timeout=15` when those are missing, so a sleeping database returns an error instead of hanging the process. It also sets `connection_limit=1` on Vercel and `connection_limit=5` elsewhere, and adds `pgbouncer=true` on Vercel when the host name contains `pooler`.

## Deploy on Vercel Hobby + Neon

Host the API on a **Vercel Hobby (free)** project. The database is **Neon Postgres on the free plan**, connected from the Vercel Marketplace. That integration injects `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct). Do not turn on a paid Vercel plan, a paid Neon compute size, or any other paid add-on.

`vercel.json` builds with `npm run build` and rewrites every path to the Node function `api/index.js`. That file exports the Express app and does not call `listen`. The Prisma client is generated with `binaryTargets` `native` and `rhel-openssl-3.0.x` so the query engine matches Vercel's Node runtime.

### 1. Import the project

1. Push this repo to GitHub.
2. In the Vercel dashboard, on the Hobby team, choose **Add New → Project** and import the repository.
3. Framework preset: **Other** (choose Express if Vercel offers that preset for this repo).
4. Node.js version: **22**.
5. Install command: `npm install` (the `postinstall` script runs `prisma generate`).
6. Build command: `npm run build`.
7. Do not set a custom start command. Vercel invokes `api/index.js`.

`npm run build` always runs `prisma generate`. It runs `prisma migrate deploy` only when `DATABASE_URL` is set, and it copies `DATABASE_URL` into `DATABASE_URL_UNPOOLED` when the direct URL is missing.

### 2. Connect free Neon

1. In the project, open **Storage** or **Marketplace** and add **Neon Postgres** (Vercel-managed Neon, free plan).
2. Connect the database to this project.
3. Confirm the integration created both variables and that they are available during the build:
   - `DATABASE_URL` — pooled host, the name contains `-pooler`
   - `DATABASE_URL_UNPOOLED` — direct host, no `-pooler`

Prisma migrations read `DATABASE_URL_UNPOOLED` via `directUrl`. The running function reads `DATABASE_URL`.

### 3. Set the app secrets

Add these for Production. Add the same names for Preview if preview deployments should log in.

| Name | Value |
| --- | --- |
| `ACCESS_TOKEN_SECRET` | `openssl rand -base64 32` |
| `REFRESH_TOKEN_SECRET` | A second random string |
| `CLIENT_URL` | Frontend origin, no trailing slash. Example: `https://your-frontend.vercel.app`. Add `,http://localhost:5173` if local Vite calls this API. |

Vercel sets `NODE_ENV=production`. Login then sets the refresh cookie to `HttpOnly; Secure; SameSite=None`. `CLIENT_URL` must be the exact browser origin or the credentialed CORS check rejects the request.

### 4. Deploy and seed

Deploy the project. The first build applies the SQL migrations to Neon.

Hobby functions have no shell. From this repo on your machine, seed with the **direct** URL:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@ep-example.region.aws.neon.tech/neondb?sslmode=require" npm run db:seed
```

Run it again any time you want the demo school put back.

### 5. Point the frontend at the API

```bash
VITE_API_BASE_URL=https://<project>.vercel.app/api/v1/
```

The trailing slash matches that client's axios base URL.

A Hobby function scales to zero when idle, and Neon free compute sleeps when idle. `/health` does not query Postgres, so it only waits for the function to start. The first real API call after a long sleep may need one retry while Neon wakes.

`render.yaml` is still a valid blueprint for a free Render web service. It is not used by the Vercel project.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Nodemon, local API on port 4000. Does not migrate unless `RUN_MIGRATIONS=true`. |
| `npm start` | Long-running process. Listens first, then migrates in the background when `NODE_ENV=production` or `RUN_MIGRATIONS=true`. On Vercel this file does not listen and does not migrate. |
| `npm run build` | `prisma generate`. Also `prisma migrate deploy` when `DATABASE_URL` is set. |
| `npm run db:migrate` | Apply migrations only. |
| `npm run db:seed` | Idempotent Willowmere demo data. |
| `npm run db:setup` | Migrate, then seed. |

## License

ISC.
