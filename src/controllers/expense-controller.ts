import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { expenseSelectFields } from "../utils/queryHelpers";

// CREATE EXPENSE
export const createExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, description, date, type, categoryId } = req.body;
  const userId = req.userId!;

  // Validate required fields
  if (!amount || !description || !categoryId) {
    throw new AppError("Missing required fields: amount, description, categoryId", 400);
  }

  // Verify category exists and belongs to user
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId: userId,
    },
  });

  if (!category) {
    throw new AppError("Category not found or doesn't belong to you", 404);
  }

  // Create expense with optimized select
  const expense = await prisma.expense.create({
    data: {
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
      type: type || "expense",
      categoryId,
      userId,
    },
    select: expenseSelectFields,
  });

  return res.status(201).json(expense);
});

// GET ALL EXPENSES
export const getAllExpenses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { startDate, endDate, categoryId, type } = req.query;

  // Build filter conditions
  const where: any = { userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId as string);
  }

  if (type) {
    where.type = type as string;
  }

  // Optimized query with select fields
  const expenses = await prisma.expense.findMany({
    where,
    select: expenseSelectFields,
    orderBy: {
      date: "desc",
    },
  });

  return res.json(expenses);
});

// GET EXPENSE BY ID
export const getExpenseById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const expenseId = parseInt(req.params.id);

  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId: userId,
    },
    select: expenseSelectFields,
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  return res.json(expense);
});

// UPDATE EXPENSE
export const updateExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const expenseId = parseInt(req.params.id);
  const { amount, description, date, categoryId } = req.body;

  // Verify expense exists and belongs to user
  const existingExpense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId: userId,
    },
  });

  if (!existingExpense) {
    throw new AppError("Expense not found", 404);
  }

  // If categoryId is being updated, verify new category belongs to user
  if (categoryId && categoryId !== existingExpense.categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: userId,
      },
    });

    if (!category) {
      throw new AppError("Category not found or doesn't belong to you", 404);
    }
  }

  // Update expense with optimized select
  const updatedExpense = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(description !== undefined && { description }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(categoryId !== undefined && { categoryId }),
    },
    select: expenseSelectFields,
  });

  return res.json(updatedExpense);
});

// DELETE EXPENSE
export const deleteExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const expenseId = parseInt(req.params.id);

  // Verify expense exists and belongs to user
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId: userId,
    },
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  // Delete expense
  await prisma.expense.delete({
    where: { id: expenseId },
  });

  return res.json({ message: "Expense deleted successfully" });
});

// EXPORT EXPENSES TO CSV
export const exportExpensesToCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { startDate, endDate, categoryId, type } = req.query;

  // Build query filters
  const where: any = { userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId as string);
  }

  if (type) {
    where.type = type as string;
  }

  // Fetch expenses with optimized select
  const expenses = await prisma.expense.findMany({
    where,
    select: expenseSelectFields,
    orderBy: {
      date: 'desc',
    },
  });

  // Generate CSV
  const csvHeaders = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const csvRows = expenses.map((expense) => {
    const date = new Date(expense.date).toLocaleDateString('en-IN');
    const description = `"${expense.description.replace(/"/g, '""')}"`;
    const category = expense.category.name;
    const type = expense.type;
    const amount = expense.amount.toFixed(2);
    return [date, description, category, type, amount].join(',');
  });

  const csv = [csvHeaders.join(','), ...csvRows].join('\n');

  // Set headers for download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
  
  return res.send(csv);
});
