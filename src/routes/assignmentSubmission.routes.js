// routes/assignmentSubmission.routes.js
import { Router } from "express";
import { AssignmentSubmissionController } from "../controllers/assignmentSubmissionController.js";
import { AssignmentSubmissionService } from "../services/assignmentSubmissionService.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOrTecherOnly } from "../middleware/teacher.middleware.js";

const router = Router();
const service = new AssignmentSubmissionService();
const controller = new AssignmentSubmissionController(service);

router.post("/", verifyJwt, controller.submitAssignment);

router.get(
  "/assignment/:assignmentId",
  verifyJwt,
  controller.getAssignmentSubmissions
);

router.get("/student/:studentId", verifyJwt, controller.getStudentSubmissions);

router.patch(
  "/grade/:submissionId",
  verifyJwt,
  adminOrTecherOnly,
  controller.gradeSubmission
);

export default router;
