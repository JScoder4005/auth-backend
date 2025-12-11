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
    origin: ["http://localhost:3000", "https://www.getpostman.com"], // include your frontend origin
    credentials: true, // important to send cookies
  })
);
// allow frontend requests with cookies
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// You can add other protected routes later
// e.g., app.use("/api/user", userRoutes);

export default app;
