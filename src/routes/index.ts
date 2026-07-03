import express from "express";
import { authRouter } from "./auth.routes";
import { categoryRouter } from "./category.routes";
import { dashboardRouter } from "./dashboard.routes";
import { transactionRouter } from "./transaction.routes";
import { reportsRouter } from "./reports.routes";
import { budgetRouter } from "./budget.routes";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/categories", categoryRouter);
router.use("/dashboard", dashboardRouter);
router.use("/transactions", transactionRouter);
router.use("/reports", reportsRouter);
router.use("/budgets", budgetRouter);

export default router;