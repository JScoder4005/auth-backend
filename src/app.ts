import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authroutes";
import expenseRoutes from "./routes/expenseRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173", 
      "http://localhost:5175",
      process.env.FRONTEND_URL || "",
    ].filter(Boolean),
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
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budgets", budgetRoutes);

// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoutes);

export default app;
