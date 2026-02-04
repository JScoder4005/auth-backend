import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for token in cookies first, then Authorization header
    let token = req.cookies.accessToken;
    
    // If no cookie, check Authorization header (Bearer token)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      }
    }
    
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload: any = verifyAccessToken(token);
    req.userId = payload.userId;

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
