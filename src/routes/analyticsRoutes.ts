import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import {
  getDashboardSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getTopCategories,
} from "../controllers/analytics-controller";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Analytics routes
router.get("/summary", getDashboardSummary);
router.get("/category-breakdown", getCategoryBreakdown);
router.get("/monthly-trends", getMonthlyTrends);
router.get("/top-categories", getTopCategories);

export default router;
