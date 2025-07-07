import { Router } from "express";
import { TimetableService } from "../services/TimetableService.js";
import { TimetableController } from "../controllers/TimetableController.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import { adminOrTecherOnly } from "../middleware/teacher.middleware.js";

const router = Router();
const timetableService = new TimetableService();
const timetableController = new TimetableController(timetableService);

router.use(verifyJwt);

router.post("/", adminOnly, timetableController.createTimetable);
router.delete("/:id", adminOnly, timetableController.deleteTimetable);
router.put("/:id", adminOnly, timetableController.updateTimetable);

router.get(
  "/teacher/:teacherId",
  adminOrTecherOnly,
  timetableController.getTimetableByTeacher
);

router.get("/", timetableController.getAllTimetables);
router.get("/class/:classId", timetableController.getTimetableByClass);
router.get("/student/:studentId", timetableController.getTimetableByStudentId);
router.get("/by-day", timetableController.getTimetableByDay);

export default router;
