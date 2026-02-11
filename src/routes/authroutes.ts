import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getAllUsers,
  getUserProfile,
} from "../controllers/auth-controller";
import { authenticate } from "../middlewares/authMiddleware";
import { validateRegister, validateLogin } from "../middlewares/validation";
import { authLimiter } from "../middlewares/rateLimiter";

const router = Router();

// Apply rate limiting to authentication routes
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// Get current user profile (requires authentication)
router.get("/me", authenticate, getUserProfile);

// Get all users (requires authentication)
router.get("/users", authenticate, getAllUsers);

export default router;
