import express from "express";
import {
    getDashboardSummary,
    getMonthlyReport,
} from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticate);

router.get("/summary", getDashboardSummary);
router.get("/report", getMonthlyReport);

export { router as dashboardRouter };