import { Router } from "express";
import { healthCheck, ping } from "../controllers/health-controller";

const router = Router();

// Health check endpoints (no authentication required)
router.get("/health", healthCheck);
router.get("/ping", ping);

export default router;
