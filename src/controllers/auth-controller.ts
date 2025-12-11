import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

// REGISTER
export const register = async (req: Request, res: Response) => {
  console.log("Register endpoint hit");
  console.log("Register request body:", req.body);
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: "User created", userId: user.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    // Save refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: false,
      maxAge: 30 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ message: "Logged in" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const payload: any = verifyRefreshToken(token);

    // Check token exists in DB
    const tokenInDb = await prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!tokenInDb) return res.status(401).json({ message: "Invalid token" });

    const accessToken = createAccessToken(payload.userId);

    res.cookie("accessToken", accessToken, {
      httpOnly: false,
      maxAge: 30 * 60 * 1000,
    });
    return res.json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.json({ message: "Logged out" });
};
