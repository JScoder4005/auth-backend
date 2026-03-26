import { Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler, AppError } from "../utils/errorHandler";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 30 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// REGISTER
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  return res.status(201).json({ message: "User created", userId: user.id });
});

// LOGIN
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid credentials", 400);

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new AppError("Invalid credentials", 400);

  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id },
  });

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.json({
    message: "Logged in",
    user: { id: user.id, email: user.email },
  });
});

// REFRESH TOKEN
export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new AppError("No token", 401);

  const payload: any = verifyRefreshToken(token);

  const tokenInDb = await prisma.refreshToken.findUnique({ where: { token } });
  if (!tokenInDb) throw new AppError("Invalid token", 401);

  const accessToken = createAccessToken(payload.userId);
  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);

  return res.json({ accessToken });
});

// LOGOUT
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.json({ message: "Logged out" });
});

// GET ALL USERS
export const getAllUsers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, createdAt: true },
  });

  return res.json({ users, count: users.length });
});

// GET USER PROFILE
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const [user, expenseCount, categoryCount, budgetCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    }),
    prisma.expense.count({ where: { userId } }),
    prisma.category.count({ where: { userId } }),
    prisma.budget.count({ where: { userId } }),
  ]);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return res.json({
    user,
    stats: { expenses: expenseCount, categories: categoryCount, budgets: budgetCount },
  });
});
