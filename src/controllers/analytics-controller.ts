import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

// GET DASHBOARD SUMMARY
export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { startDate, endDate } = req.query;

  try {
    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);
    }

    // Get all expenses and income
    const transactions = await prisma.expense.findMany({
      where: {
        userId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      include: {
        category: true,
      },
    });

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Calculate previous period for comparison
    let previousPeriodData = null;
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const periodLength = end.getTime() - start.getTime();

      const previousStart = new Date(start.getTime() - periodLength);
      const previousEnd = new Date(start);

      const previousTransactions = await prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      });

      const previousIncome = previousTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const previousExpenses = previousTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate percentage changes
      const incomeChange =
        previousIncome > 0
          ? ((totalIncome - previousIncome) / previousIncome) * 100
          : 0;

      const expenseChange =
        previousExpenses > 0
          ? ((totalExpenses - previousExpenses) / previousExpenses) * 100
          : 0;

      previousPeriodData = {
        income: previousIncome,
        expenses: previousExpenses,
        incomeChange: parseFloat(incomeChange.toFixed(1)),
        expenseChange: parseFloat(expenseChange.toFixed(1)),
      };
    }

    // Category breakdown
    const categoryBreakdown = transactions.reduce((acc: any[], transaction) => {
      const categoryName = transaction.category.name;
      const existing = acc.find((item) => item.category === categoryName);

      if (existing) {
        existing.amount += transaction.amount;
        existing.count += 1;
      } else {
        acc.push({
          category: categoryName,
          categoryId: transaction.categoryId,
          color: transaction.category.color,
          icon: transaction.category.icon,
          amount: transaction.amount,
          count: 1,
          type: transaction.type,
        });
      }

      return acc;
    }, []);

    // Sort by amount descending
    categoryBreakdown.sort((a, b) => b.amount - a.amount);

    return res.json({
      totalIncome,
      totalExpenses,
      balance,
      savings: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      categoryBreakdown,
      ...(previousPeriodData && { comparison: previousPeriodData }),
    });
  } catch (err) {
    console.error("Get dashboard summary error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET CATEGORY BREAKDOWN (for pie chart)
export const getCategoryBreakdown = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { startDate, endDate, type } = req.query;

  try {
    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        ...(type && { type: type as string }),
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      include: {
        category: true,
      },
    });

    // Group by category
    const breakdown = expenses.reduce((acc: any[], expense) => {
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
    }, []);

    // Sort by value
    breakdown.sort((a, b) => b.value - a.value);

    return res.json(breakdown);
  } catch (err) {
    console.error("Get category breakdown error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET MONTHLY TRENDS (for line/bar chart)
export const getMonthlyTrends = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { months = "6" } = req.query; // Default to last 6 months

  try {
    const monthsCount = parseInt(months as string);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Group by month
    const monthlyData = new Map<string, { income: number; expenses: number }>();

    expenses.forEach((expense) => {
      const monthKey = expense.date.toISOString().substring(0, 7); // YYYY-MM format

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

    // Convert to array and sort by date
    const trends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        savings: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return res.json(trends);
  } catch (err) {
    console.error("Get monthly trends error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET TOP CATEGORIES
export const getTopCategories = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { limit = "5", type = "expense" } = req.query;

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        type: type as string,
      },
      include: {
        category: true,
      },
    });

    // Group by category and calculate totals
    const categoryTotals = expenses.reduce((acc: any[], expense) => {
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
    }, []);

    // Sort by total descending and limit
    const topCategories = categoryTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, parseInt(limit as string));

    return res.json(topCategories);
  } catch (err) {
    console.error("Get top categories error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
