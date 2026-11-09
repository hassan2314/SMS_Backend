import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "../src/middleware/errorHandler.middleware.js";

const app = express();

app.set("trust proxy", 1);

const defaultClientOrigin = "http://localhost:5173";

function allowedClientOrigins() {
  return (process.env.CLIENT_URL || defaultClientOrigin)
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      const allowed = allowedClientOrigins().includes(origin.replace(/\/$/, ""));
      callback(null, allowed);
    },
    credentials: true,
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "sms-backend",
    uptime: Math.round(process.uptime()),
  });
});

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "School Management System API",
    health: "/health",
    api: "/api/v1",
  });
});

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//import rotuers
import userRouter from "./routes/user.routes.js";
import classRouter from "./routes/class.routes.js";
import teacherRouter from "./routes/teacher.routes.js";
import studentRouter from "./routes/student.routes.js";
import subjectDropRequestRouter from "./routes/subjectDropRequest.routes.js";
import adminRouter from "./routes/admin.routes.js";
import timetableRouter from "./routes/timetable.routes.js";
import assignmentRouter from "./routes/assignment.routes.js";
import assigmentSubmissionRouter from "./routes/assignmentSubmission.routes.js";
import subjectRouter from "./routes/subject.routes.js";
import monthlyResultRouter from "./routes/monthlyResult.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/classes", classRouter);
app.use("/api/v1/teachers", teacherRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/subjectDrops", subjectDropRequestRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/timetable", timetableRouter);
app.use("/api/v1/assignments", assignmentRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/monthlyResults", monthlyResultRouter);
app.use("/api/v1/assignmentSubmissions", assigmentSubmissionRouter);
app.use("/api/v1/attendances", attendanceRouter);

app.use(errorHandler);
export default app;
