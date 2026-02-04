import { Router } from "express";
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  exportExpensesToCSV,
} from "../controllers/expense-controller";
import { authenticate } from "../middlewares/authMiddleware";
import { validateExpense } from "../middlewares/validation";

const router = Router();

// All expense routes require authentication
router.use(authenticate);

// POST /api/expenses - Create new expense
router.post("/", validateExpense, createExpense);

// GET /api/expenses - Get all expenses (with optional filters)
router.get("/", getAllExpenses);

// GET /api/expenses/export/csv - Export expenses to CSV
router.get("/export/csv", exportExpensesToCSV);

// GET /api/expenses/:id - Get expense by ID
router.get("/:id", getExpenseById);

// PUT /api/expenses/:id - Update expense
router.put("/:id", updateExpense);

// DELETE /api/expenses/:id - Delete expense
router.delete("/:id", deleteExpense);

export default router;
