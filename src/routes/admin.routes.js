import { Router } from "express";
import { AdminService } from "../services/AdminService.js";
import { AdminController } from "../controllers/AdminController.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = Router();
const adminService = new AdminService();
const adminController = new AdminController(adminService);

router.use(verifyJwt, adminOnly);

router.get("/users", adminController.getAllUsers);
router.delete("/users/:id", adminController.deleteUserById);
router.put("/users/:id/role", adminController.updateUserRole);

router.get("/user-role-stats", adminController.getUserStatsByRole);
router.get("/overview-stats", adminController.getOverviewStats);
router.get("/assignment-stats", adminController.getAssignmentStats);
router.get("/attendance-summary", adminController.getAttendanceSummary);
router.get("/stats/monthly-results", adminController.getMonthlyResultStats);
router.get("/users/:id", adminController.findDetailById);

export default router;
