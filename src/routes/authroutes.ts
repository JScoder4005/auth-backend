import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getAllUsers,
} from "../controllers/auth-controller";
import { authenticate } from "../middlewares/authMiddleware";
import { validateRegister, validateLogin } from "../middlewares/validation";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// Get all users (requires authentication)
router.get("/users", authenticate, getAllUsers);

export default router;
