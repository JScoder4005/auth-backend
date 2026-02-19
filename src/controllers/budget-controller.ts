import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { budgetSelectFields } from "../utils/queryHelpers";

// CREATE BUDGET
export const createBudget = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, amount, period, categoryId } = req.body;
  const userId = req.userId!;

  if (!name || !amount) {
    throw new AppError("Name and amount are required", 400);
  }

  // If categoryId provided, verify it belongs to user
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
      select: { id: true },
    });
    if (!category) {
      throw new AppError("Category not found", 404);
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
    select: budgetSelectFields,
  });

  return res.status(201).json(budget);
});

// GET ALL BUDGETS
export const getAllBudgets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const budgets = await prisma.budget.findMany({
    where: { userId },
    select: budgetSelectFields,
    orderBy: { createdAt: "desc" },
  });

  return res.json(budgets);
});

// GET BUDGET BY ID
export const getBudgetById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const budgetId = parseInt(req.params.id);

  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
    select: budgetSelectFields,
  });

  if (!budget) {
    throw new AppError("Budget not found", 404);
  }

  return res.json(budget);
});

// GET BUDGET PROGRESS
export const getBudgetProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const budgetId = parseInt(req.params.id);

  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
    select: budgetSelectFields,
  });

  if (!budget) {
    throw new AppError("Budget not found", 404);
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

  // Use aggregate instead of findMany to avoid loading all expense records
  const result = await prisma.expense.aggregate({
    where: {
      userId,
      type: "expense",
      date: { gte: startDate, lte: now },
      ...(budget.categoryId && { categoryId: budget.categoryId }),
    },
    _sum: { amount: true },
  });

  const spent = result._sum.amount ?? 0;
  const remaining = budget.amount - spent;
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  return res.json({
    budget,
    spent,
    remaining,
    percentage: parseFloat(percentage.toFixed(1)),
    periodStart: startDate,
    periodEnd: now,
  });
});

// UPDATE BUDGET
export const updateBudget = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const budgetId = parseInt(req.params.id);
  const { name, amount, period, categoryId } = req.body;

  const existingBudget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
    select: { id: true },
  });

  if (!existingBudget) {
    throw new AppError("Budget not found", 404);
  }

  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
      select: { id: true },
    });
    if (!category) {
      throw new AppError("Category not found", 404);
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
    select: budgetSelectFields,
  });

  return res.json(budget);
});

// DELETE BUDGET
export const deleteBudget = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const budgetId = parseInt(req.params.id);

  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
    select: { id: true },
  });

  if (!budget) {
    throw new AppError("Budget not found", 404);
  }

  await prisma.budget.delete({ where: { id: budgetId } });

  return res.json({ message: "Budget deleted successfully" });
});
