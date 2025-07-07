import { Router } from "express";
import { AssignmentService } from "../services/AssignmentService.js";
import { AssignmentController } from "../controllers/AssignmentController.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOrTecherOnly } from "../middleware/teacher.middleware.js";

const router = Router();
const service = new AssignmentService();
const controller = new AssignmentController(service);

router.post("/", verifyJwt, adminOrTecherOnly, controller.create);

router.get("/class/:classId", verifyJwt, controller.getByClass);
router.get("/subject/:subjectId", verifyJwt, controller.getBySubject);
router.get("/teacher/:teacherId", verifyJwt, controller.getByTeacher);

router.delete("/:id", verifyJwt, adminOrTecherOnly, controller.delete);

export default router;
