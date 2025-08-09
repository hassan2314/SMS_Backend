import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "../src/middleware/errorHandler.middleware.js";

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//import rotuers
import userRouter from "./routes/user.routes.js";
import classRouter from "./routes/class.routes.js";
import teacherRouter from "./routes/teacher.route.js";
import studentRouter from "./routes/student.routes.js";
import subjectDropRequestRouter from "./routes/subjectDropRequest.routes.js";
import adminRouter from "./routes/admin.routes.js";
import timetableRouter from "./routes/timetable.routes.js";
import assignmentRouter from "./routes/assignment.routes.js";
import assigmentSubmissionRouter from "./routes/assignmentSubmission.routes.js";
import subjectRouter from "./routes/subject.routes.js";
import monthlyResultRouter from "./routes/monthlyResult.routes.js";

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

app.use(errorHandler);
export default app;
