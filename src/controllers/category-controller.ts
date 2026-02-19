import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { categorySelectFields } from "../utils/queryHelpers";

// CREATE CATEGORY
export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, icon, color, type } = req.body;
  const userId = req.userId!;

  if (!name || !type) {
    throw new AppError("Missing required fields: name, type", 400);
  }

  if (type !== "expense" && type !== "income") {
    throw new AppError("Type must be either 'expense' or 'income'", 400);
  }

  // Check for duplicate category name for user
  const existingCategory = await prisma.category.findFirst({
    where: { userId, name },
    select: { id: true },
  });

  if (existingCategory) {
    throw new AppError("Category with this name already exists", 400);
  }

  const category = await prisma.category.create({
    data: {
      name,
      icon: icon || null,
      color: color || null,
      type,
      userId,
    },
    select: categorySelectFields,
  });

  return res.status(201).json(category);
});

// GET ALL CATEGORIES
export const getAllCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { type } = req.query;

  const where: { userId: number; type?: string } = { userId };
  if (type && (type === "expense" || type === "income")) {
    where.type = type;
  }

  const categories = await prisma.category.findMany({
    where,
    select: categorySelectFields,
    orderBy: { createdAt: "desc" },
  });

  return res.json(categories);
});

// DELETE CATEGORY
export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const categoryId = parseInt(req.params.id);

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Use count instead of findMany to avoid loading all expenses
  const expenseCount = await prisma.expense.count({
    where: { categoryId },
  });

  if (expenseCount > 0) {
    throw new AppError(
      `Cannot delete category. It has ${expenseCount} associated expense(s)`,
      400
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });

  return res.json({ message: "Category deleted successfully" });
});
