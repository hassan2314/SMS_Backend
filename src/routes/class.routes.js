import { Router } from "express";
import { ClassController } from "../controllers/ClassController.js";
import { ClassService } from "../services/ClassService.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = Router();

const classService = new ClassService();
const classController = new ClassController(classService);

// Only Admin
router.post("/", verifyJwt, adminOnly, classController.createClass);
router.put("/:id", verifyJwt, adminOnly, classController.updateClass);
router.delete("/:id", verifyJwt, adminOnly, classController.deleteClass);

// Every User
router.get("/:id", verifyJwt, classController.getClassById);
router.get("/", verifyJwt, classController.getAllClasses);

export default router;
