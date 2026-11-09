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

- Node.js 20+ (ES modules), Express 5
- Prisma 6 and PostgreSQL
- JWT (`jsonwebtoken`) and `bcryptjs`
- `cors` and `cookie-parser`

## Architecture

HTTP JSON hits Express routes in `src/app.js`, controllers validate and shape the response, services talk to a single Prisma client, and Prisma talks to PostgreSQL.

Access tokens travel in `Authorization: Bearer <token>`. Refresh tokens travel in an httpOnly cookie named `refreshToken`. Successful JSON bodies use `{ success, statusCode, message, data }`.

The Prisma schema and migrations are at `src/db/prisma/prisma/`. `package.json` points the Prisma CLI at that schema, so the usual `prisma` commands work from the repo root.

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

Requirements: Node.js 20 or newer, and a Postgres database (local Postgres, [Neon](https://neon.tech) free, or [Supabase](https://supabase.com) free).

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
| `DATABASE_URL` | Yes | Postgres connection string. Use the direct (non-pooler) URL so migrations work. Include `sslmode=require` on Neon and Supabase. |
| `ACCESS_TOKEN_SECRET` | Yes | Signs access tokens. Long random string. |
| `REFRESH_TOKEN_SECRET` | Yes | Signs refresh tokens. A different long random string. |
| `CLIENT_URL` | Yes in production | Allowed browser origins, comma-separated, no trailing slash. Example: `https://your-app.vercel.app,http://localhost:5173`. Defaults to `http://localhost:5173`. |
| `PORT` | No | Listen port. Defaults to `4000`. Render sets this. |
| `NODE_ENV` | No | `production` on Render. Enables Secure, `SameSite=None` refresh cookies for a separate frontend host. |
| `RUN_MIGRATIONS` | No | `true` runs `prisma migrate deploy` in the background after the server starts listening. `false` skips it. Production defaults to running it. |
| `MIGRATE_TIMEOUT_MS` | No | How long that background migrate may run. Default `60000`. |

A shell `DATABASE_URL` wins over `.env`, which is how you seed a hosted database without editing the local file.

The server adds `connect_timeout=15`, `pool_timeout=15`, and `connection_limit=5` when those are missing, so a sleeping database returns an error instead of hanging the process.

## Deploy on the free tier

Use a **free Render web service** plus **free Neon or Supabase Postgres**. This repo does not provision a paid instance, disk, or database. Render's own free Postgres expires 30 days after creation, so keep the data on Neon or Supabase.

`render.yaml` is a Render blueprint for the free web service. It does not create a database. `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are generated by Render and are not stored in git.

### 1. Create the database

**Neon (free)**

1. Create a project on the Neon free plan.
2. Open Connect and copy the **direct** connection string. The hostname must not contain `-pooler`.
3. It looks like `postgresql://USER:PASSWORD@ep-example.region.aws.neon.tech/neondb?sslmode=require`.

**Supabase (free)** is the same idea: Project Settings → Database → URI for the **direct** host `db.<project-ref>.supabase.co` on port **5432**. Do not use the transaction pooler on port 6543. Add `?sslmode=require` if it is missing.

Use that one string as `DATABASE_URL` for both the app and `prisma migrate deploy`. This process is a single Node server, so it does not need PgBouncer, and migrations through a transaction pooler fail.

### 2. Create the Render web service

1. Push this repo to GitHub.
2. In the Render dashboard, choose **New → Blueprint** and select the repo (this applies `render.yaml`), or choose **New → Web Service** and set the values below yourself.
3. Instance type: **Free**.
4. Build command: `npm install && npm run build`  
   `npm run build` is `prisma generate && prisma migrate deploy`.
5. Start command: `npm start`
6. Health check path: `/health`
7. Environment variables:

| Name | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22` |
| `RUN_MIGRATIONS` | `true` |
| `DATABASE_URL` | The direct Postgres URL from step 1. Leave it available during builds so migrate can run. |
| `CLIENT_URL` | The frontend origin, no trailing slash. Add `http://localhost:5173` after a comma if you still call the hosted API from local Vite. |
| `ACCESS_TOKEN_SECRET` | `openssl rand -base64 32` (the blueprint generates one for you) |
| `REFRESH_TOKEN_SECRET` | A second random string |

8. Deploy. The process binds `0.0.0.0` and `PORT` immediately. `/health` does not query Postgres, so a cold database cannot fail Render's health check (a missing `2xx` within 5 seconds marks the instance unhealthy). Queries give up after the connect timeout above. The background migrate is killed after `MIGRATE_TIMEOUT_MS` if the database never answers, and the port stays open.

### 3. Seed Willowmere

Free Render web services have no shell. From your machine, with this repo installed:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" npm run db:seed
```

Run it again any time you want the demo school put back.

### 4. Point the frontend at the API

In the frontend project set:

```bash
VITE_API_BASE_URL=https://<your-service>.onrender.com/api/v1/
```

The trailing slash matches that client's axios base URL. `CLIENT_URL` on this API must be the site the browser is actually on (scheme and host only).

Free Render web services sleep after about 15 minutes without traffic. The next request wakes them, which can take around a minute. Neon free compute also sleeps when idle. `/health` still returns as soon as the Node process is up. The first real API call after a long sleep may need one retry while Postgres wakes.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Nodemon, local API on port 4000. Does not migrate unless `RUN_MIGRATIONS=true`. |
| `npm start` | Production process. Listens first, then migrates in the background when `NODE_ENV=production` or `RUN_MIGRATIONS=true`. |
| `npm run build` | `prisma generate` and `prisma migrate deploy`. |
| `npm run db:migrate` | Apply migrations only. |
| `npm run db:seed` | Idempotent Willowmere demo data. |
| `npm run db:setup` | Migrate, then seed. |

## License

ISC.
