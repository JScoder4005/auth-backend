import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/errorHandler";
import { buildDateFilter } from "../utils/queryHelpers";

// GET DASHBOARD SUMMARY
export const getDashboardSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { startDate, endDate } = req.query;

  const dateFilter = buildDateFilter(startDate as string, endDate as string);

  const transactions = await prisma.expense.findMany({
    where: { userId, ...dateFilter },
    include: { category: true },
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate previous period for comparison
  let previousPeriodData = null;
  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const periodLength = end.getTime() - start.getTime();

    const previousTransactions = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: new Date(start.getTime() - periodLength),
          lte: start,
        },
      },
    });

    const previousIncome = previousTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const previousExpenses = previousTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    previousPeriodData = {
      income: previousIncome,
      expenses: previousExpenses,
      incomeChange: parseFloat(
        (previousIncome > 0 ? ((totalIncome - previousIncome) / previousIncome) * 100 : 0).toFixed(1)
      ),
      expenseChange: parseFloat(
        (previousExpenses > 0 ? ((totalExpenses - previousExpenses) / previousExpenses) * 100 : 0).toFixed(1)
      ),
    };
  }

  // Category breakdown
  const categoryBreakdown = transactions
    .reduce((acc: any[], transaction) => {
      const existing = acc.find((item) => item.category === transaction.category.name);
      if (existing) {
        existing.amount += transaction.amount;
        existing.count += 1;
      } else {
        acc.push({
          category: transaction.category.name,
          categoryId: transaction.categoryId,
          color: transaction.category.color,
          icon: transaction.category.icon,
          amount: transaction.amount,
          count: 1,
          type: transaction.type,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.amount - a.amount);

  return res.json({
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    savings: totalIncome - totalExpenses,
    transactionCount: transactions.length,
    categoryBreakdown,
    ...(previousPeriodData && { comparison: previousPeriodData }),
  });
});

// GET CATEGORY BREAKDOWN (for pie chart)
export const getCategoryBreakdown = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { startDate, endDate, type } = req.query;

  const dateFilter = buildDateFilter(startDate as string, endDate as string);

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      ...(type && { type: type as string }),
      ...dateFilter,
    },
    include: { category: true },
  });

  const breakdown = expenses
    .reduce((acc: any[], expense) => {
      const existing = acc.find((item) => item.categoryId === expense.categoryId);
      if (existing) {
        existing.value += expense.amount;
        existing.count += 1;
      } else {
        acc.push({
          name: expense.category.name,
          categoryId: expense.categoryId,
          value: expense.amount,
          count: 1,
          color: expense.category.color || "#8884d8",
          icon: expense.category.icon,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  return res.json(breakdown);
});

// GET MONTHLY TRENDS (for line/bar chart)
export const getMonthlyTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { months = "6" } = req.query;

  const monthsCount = parseInt(months as string);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsCount);

  const expenses = await prisma.expense.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
  });

  const monthlyData = new Map<string, { income: number; expenses: number }>();

  expenses.forEach((expense) => {
    const monthKey = expense.date.toISOString().substring(0, 7);
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { income: 0, expenses: 0 });
    }
    const data = monthlyData.get(monthKey)!;
    if (expense.type === "income") {
      data.income += expense.amount;
    } else {
      data.expenses += expense.amount;
    }
  });

  const trends = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return res.json(trends);
});

// GET TOP CATEGORIES
export const getTopCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { limit = "5", type = "expense" } = req.query;

  const expenses = await prisma.expense.findMany({
    where: { userId, type: type as string },
    include: { category: true },
  });

  const topCategories = expenses
    .reduce((acc: any[], expense) => {
      const existing = acc.find((item) => item.categoryId === expense.categoryId);
      if (existing) {
        existing.total += expense.amount;
        existing.count += 1;
      } else {
        acc.push({
          categoryId: expense.categoryId,
          name: expense.category.name,
          color: expense.category.color,
          icon: expense.category.icon,
          total: expense.amount,
          count: 1,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.total - a.total)
    .slice(0, parseInt(limit as string));

  return res.json(topCategories);
});
