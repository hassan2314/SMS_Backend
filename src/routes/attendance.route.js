import { Router } from "express";
import { AttendanceService } from "../services/AttendanceService.js";
import { AttendanceController } from "../controllers/AttendanceController.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOrTecherOnly } from "../middleware/teacher.middleware.js";

const router = Router();
const service = new AttendanceService();
const controller = new AttendanceController(service);

router.post("/mark", verifyJwt, adminOrTecherOnly, controller.markAttendance);

router.get("/:studentId", verifyJwt, controller.getStudentAttendance);

router.get(
  "/class/:classId",
  verifyJwt,
  adminOrTecherOnly,
  controller.getClassAttendance
);

router.get("/:id", verifyJwt, controller.getAttendancePercentageOfUser);

router.get(
  "/all",
  verifyJwt,
  adminOrTecherOnly,
  controller.getAttendancePercentageBySubject
);

export default router;
