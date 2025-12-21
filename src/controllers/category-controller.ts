import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

// CREATE CATEGORY
export const createCategory = async (req: AuthRequest, res: Response) => {
  const { name, icon, color, type } = req.body;
  const userId = req.userId!;

  try {
    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ 
        message: "Missing required fields: name, type" 
      });
    }

    // Validate type
    if (type !== "expense" && type !== "income") {
      return res.status(400).json({ 
        message: "Type must be either 'expense' or 'income'" 
      });
    }

    // Check for duplicate category name for user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (existingCategory) {
      return res.status(400).json({ 
        message: "Category with this name already exists" 
      });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        icon: icon || null,
        color: color || null,
        type,
        userId,
      },
    });

    return res.status(201).json(category);
  } catch (err) {
    console.error("Create category error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET ALL CATEGORIES
export const getAllCategories = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { type } = req.query;

  try {
    // Build filter conditions
    const where: any = { userId };

    if (type) {
      where.type = type as string;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(categories);
  } catch (err) {
    console.error("Get categories error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const categoryId = parseInt(req.params.id);

  try {
    // Verify category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: userId,
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has associated expenses
    const expenseCount = await prisma.expense.count({
      where: {
        categoryId: categoryId,
      },
    });

    if (expenseCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${expenseCount} associated expense(s)` 
      });
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Delete category error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
