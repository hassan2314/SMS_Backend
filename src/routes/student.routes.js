import { Router } from "express";
import { StudentController } from "../controllers/StudentController.js";
import { StudentService } from "../services/StudentService.js";
import verifyJwt from "../middleware/auth.middleware.js";

const router = Router();

const studentService = new StudentService();
const studentController = new StudentController(studentService);

router.get("/", studentController.getAllStudents);

router.get("/:id", verifyJwt, studentController.getStudentById);

export default router;
