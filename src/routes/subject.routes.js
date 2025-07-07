import { Router } from "express";
import { SubjectController } from "../controllers/SubjectController.js";
import { SubjectService } from "../services/SubjectService.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = Router();

const subjectService = new SubjectService();
const subjectController = new SubjectController(subjectService);

router.post("/", verifyJwt, adminOnly, subjectController.createSubject);
router.put("/:id", verifyJwt, adminOnly, subjectController.updateSubject);
router.delete("/:id", verifyJwt, adminOnly, subjectController.deleteSubject);

router.get("/", verifyJwt, subjectController.getAllSubjects);
router.get("/:id", verifyJwt, subjectController.getSubjectById);
router.get(
  "/class/:classId",
  verifyJwt,
  subjectController.getSubjectsByClassId
);
router.get(
  "/teacher/:teacherId",
  verifyJwt,
  subjectController.getSubjectsByTeacherId
);

export default router;
