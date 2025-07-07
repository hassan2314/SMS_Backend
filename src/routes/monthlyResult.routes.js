import { Router } from "express";
import { MonthlyResultService } from "../services/MonthlyResultService.js";
import { MonthlyResultController } from "../controllers/MonthlyResultController.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOrTecherOnly } from "../middleware/teacher.middleware.js";

const router = Router();

const service = new MonthlyResultService();
const controller = new MonthlyResultController(service);

router.post("/", verifyJwt, adminOrTecherOnly, controller.addResult);
router.put("/:id", verifyJwt, adminOrTecherOnly, controller.updateResult);
router.get("/student/:studentId", verifyJwt, controller.getStudentResults);
router.get("/month/:month", verifyJwt, controller.getResultsByMonth);

router.get("/class/:classId", verifyJwt, controller.getResultsByClass);

export default router;
