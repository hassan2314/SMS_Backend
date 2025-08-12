import { Router } from "express";
import { TeacherService } from "../services/TeacherService.js";
import { TeacherController } from "../controllers/TeacherController.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOrTecherOnly } from "../middleware/teacher.middleware.js";

const router = Router();

const teacherService = new TeacherService();
const teacherController = new TeacherController(teacherService);

router.get("/", verifyJwt, teacherController.getAllTeachers);
router.get("/class/:classId", verifyJwt, teacherController.getTeachersByClass);

router.get(
  "/:id",
  verifyJwt,
  adminOrTecherOnly,
  teacherController.getTeacherById
);
router.post(
  "/assign-class",
  verifyJwt,
  adminOrTecherOnly,
  teacherController.assignClassToStudent
);
router.put(
  "/:studentId/update-class",
  verifyJwt,
  adminOrTecherOnly,
  teacherController.updateStudentClassById
);

export default router;
