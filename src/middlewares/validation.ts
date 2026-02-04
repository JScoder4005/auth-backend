import { Request, Response, NextFunction } from "express";

/**
 * Validation middleware for authentication endpoints
 */

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  // Check if fields are present
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
      errors: {
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined,
      },
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
      errors: { email: "Please provide a valid email address" },
    });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password too weak",
      errors: { password: "Password must be at least 6 characters long" },
    });
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  // Check if fields are present
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
      errors: {
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined,
      },
    });
  }

  next();
};

export const validateExpense = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { amount, description, category } = req.body;

  const errors: any = {};

  if (amount === undefined || amount === null) {
    errors.amount = "Amount is required";
  } else if (typeof amount !== "number" || amount <= 0) {
    errors.amount = "Amount must be a positive number";
  }

  if (!description || description.trim() === "") {
    errors.description = "Description is required";
  }

  if (!category || category.trim() === "") {
    errors.category = "Category is required";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  next();
};
