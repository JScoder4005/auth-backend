import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authroutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware - MUST come before routes
app.use(express.json());
app.use(cookieParser());

// Logger middleware - logs all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Routes
app.use("/api/auth", authRoutes);

// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoutes);

export default app;
