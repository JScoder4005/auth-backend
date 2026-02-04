import { Request, Response } from "express";
import { prisma } from "../config/prisma";

/**
 * Health check endpoint to verify API and database status
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        api: "operational",
        database: "operational",
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        api: "operational",
        database: "down",
      },
      error: "Database connection failed",
    });
  }
};

/**
 * Simple ping endpoint
 */
export const ping = (req: Request, res: Response) => {
  return res.status(200).json({
    message: "pong",
    timestamp: new Date().toISOString(),
  });
};
