import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { UserService } from "../services/UserService.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = Router();

const userService = new UserService();
const userController = new UserController(userService);

// Auth routes
router.post("/register", userController.createUser);
router.post("/refresh-token", userController.refreshAccessToken);
router.post("/login", userController.loginUser);
router.post("/logout", verifyJwt, userController.logoutUser);

// Admin routes
router.get("/users", verifyJwt, adminOnly, userController.getUsers);
router.delete(
  "/delete/:id",
  verifyJwt,
  adminOnly,
  userController.deleteByAdmin
);

// User profile & settings
router.put("/update", verifyJwt, userController.updateUser);
router.put("/change-password", verifyJwt, userController.changePassword);
router.delete("/delete", verifyJwt, userController.deleteUser);

// Should be last (to avoid conflict with "/users" and "/delete/:id")
router.get("/:id", userController.getUserById);

export default router;
