import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

// CREATE EXPENSE
export const createExpense = async (req: AuthRequest, res: Response) => {
  const { amount, description, date, type, categoryId } = req.body;
  const userId = req.userId!;

  try {
    // Validate required fields
    if (!amount || !description || !categoryId) {
      return res.status(400).json({ 
        message: "Missing required fields: amount, description, categoryId" 
      });
    }

    // Verify category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: userId,
      },
    });

    if (!category) {
      return res.status(404).json({ 
        message: "Category not found or doesn't belong to you" 
      });
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
        type: type || "expense",
        categoryId,
        userId,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json(expense);
  } catch (err) {
    console.error("Create expense error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET ALL EXPENSES
export const getAllExpenses = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { startDate, endDate, categoryId, type } = req.query;

  try {
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

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return res.json(expenses);
  } catch (err) {
    console.error("Get expenses error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET EXPENSE BY ID
export const getExpenseById = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const expenseId = parseInt(req.params.id);

  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: userId,
      },
      include: {
        category: true,
      },
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.json(expense);
  } catch (err) {
    console.error("Get expense by ID error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// UPDATE EXPENSE
export const updateExpense = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const expenseId = parseInt(req.params.id);
  const { amount, description, date, categoryId } = req.body;

  try {
    // Verify expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: userId,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({ message: "Expense not found" });
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
        return res.status(404).json({ 
          message: "Category not found or doesn't belong to you" 
        });
      }
    }

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        category: true,
      },
    });

    return res.json(updatedExpense);
  } catch (err) {
    console.error("Update expense error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE EXPENSE
export const deleteExpense = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const expenseId = parseInt(req.params.id);

  try {
    // Verify expense exists and belongs to user
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: userId,
      },
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Delete expense
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Delete expense error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// EXPORT EXPENSES TO CSV
export const exportExpensesToCSV = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { startDate, endDate, categoryId, type } = req.query;

  try {
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

    // Fetch expenses
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
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
  } catch (err) {
    console.error('Export expenses error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
