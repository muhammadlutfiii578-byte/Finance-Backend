import express from "express";
import { getMonthlyReport } from "../controllers/reports.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticate);
router.get("/monthly", getMonthlyReport);

export { router as reportsRouter };