import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import {
  createBudget,
  getAllBudgets,
  getBudgetById,
  getBudgetProgress,
  updateBudget,
  deleteBudget,
} from "../controllers/budget-controller";

const router = express.Router();

router.use(authenticate);

router.post("/", createBudget);
router.get("/", getAllBudgets);
router.get("/:id", getBudgetById);
router.get("/:id/progress", getBudgetProgress);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;
