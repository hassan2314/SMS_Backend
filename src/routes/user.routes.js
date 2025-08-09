import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { UserService } from "../services/UserService.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = Router();

const userService = new UserService();
const userController = new UserController(userService);

router.post("/register", userController.createUser);
router.post("/refresh-token", userController.refreshAccessToken);
router.post("/login", userController.loginUser);
router.post("/logout", verifyJwt, userController.logoutUser);
router.get("/me", verifyJwt, userController.getUser);
router.put("/update", verifyJwt, userController.updateUser);
router.put("/change-password", verifyJwt, userController.changePassword);
router.delete("/delete", verifyJwt, userController.deleteUser);
router.delete(
  "/delete/:id",
  verifyJwt,
  adminOnly,
  userController.deleteByAdmin
);
router.get("/users", verifyJwt, adminOnly, userController.getUsers);

export default router;
