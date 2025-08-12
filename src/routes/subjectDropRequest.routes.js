import { Router } from "express";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOrTecherOnly } from "../middleware/teacher.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

import { SubjectDropRequestService } from "../services/SubjectDropRequestService.js";
import { SubjectDropRequestController } from "../controllers/SubjectDropRequestController.js";

const router = Router();
const service = new SubjectDropRequestService();
const subjectDropRequestController = new SubjectDropRequestController(service);

router.post(
  "/",
  verifyJwt,
  adminOrTecherOnly,
  subjectDropRequestController.createRequest
);
router.get(
  "/my",
  verifyJwt,
  adminOrTecherOnly,
  subjectDropRequestController.getRequestsByTeacher
);

router.get(
  "/",
  verifyJwt,
  adminOnly,
  subjectDropRequestController.getAllRequests
);
router.get(
  "/:id",
  verifyJwt,
  adminOnly,
  subjectDropRequestController.getRequestById
);
router.put(
  "/:id",
  verifyJwt,
  adminOnly,
  subjectDropRequestController.updateRequestStatus
);

export default router;
