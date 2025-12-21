import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  deleteCategory,
} from "../controllers/category-controller";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// All category routes require authentication
router.use(authenticate);

// POST /api/categories - Create new category
router.post("/", createCategory);

// GET /api/categories - Get all categories (with optional type filter)
router.get("/", getAllCategories);

// DELETE /api/categories/:id - Delete category
router.delete("/:id", deleteCategory);

export default router;
