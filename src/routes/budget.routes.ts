import express from "express";
import { createBudget, getBudgets, getBudgetComparison, updateBudget, deleteBudget } from "../controllers/budget.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticate);
router.get("/", getBudgets);
router.post("/", createBudget);
router.get("/comparison", getBudgetComparison);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export { router as budgetRouter };