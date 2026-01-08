import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

// CREATE BUDGET
export const createBudget = async (req: AuthRequest, res: Response) => {
  const { name, amount, period, categoryId } = req.body;
  const userId = req.userId!;

  try {
    if (!name || !amount) {
      return res.status(400).json({ message: "Name and amount are required" });
    }

    // If categoryId provided, verify it belongs to user
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId },
      });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        amount: parseFloat(amount),
        period: period || "monthly",
        categoryId: categoryId || null,
        userId,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json(budget);
  } catch (err) {
    console.error("Create budget error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET ALL BUDGETS
export const getAllBudgets = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  try {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(budgets);
  } catch (err) {
    console.error("Get budgets error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET BUDGET BY ID
export const getBudgetById = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const budgetId = parseInt(req.params.id);

  try {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
      include: { category: true },
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    return res.json(budget);
  } catch (err) {
    console.error("Get budget error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET BUDGET PROGRESS
export const getBudgetProgress = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const budgetId = parseInt(req.params.id);

  try {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
      include: { category: true },
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (budget.period) {
      case "daily":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Get expenses for this budget period
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        type: "expense",
        date: { gte: startDate, lte: now },
        ...(budget.categoryId && { categoryId: budget.categoryId }),
      },
    });

    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;

    return res.json({
      budget,
      spent,
      remaining,
      percentage: parseFloat(percentage.toFixed(1)),
      periodStart: startDate,
      periodEnd: now,
    });
  } catch (err) {
    console.error("Get budget progress error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// UPDATE BUDGET
export const updateBudget = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const budgetId = parseInt(req.params.id);
  const { name, amount, period, categoryId } = req.body;

  try {
    const existingBudget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!existingBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId },
      });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        ...(name && { name }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(period && { period }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
      },
      include: { category: true },
    });

    return res.json(budget);
  } catch (err) {
    console.error("Update budget error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE BUDGET
export const deleteBudget = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const budgetId = parseInt(req.params.id);

  try {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    await prisma.budget.delete({ where: { id: budgetId } });

    return res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error("Delete budget error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
