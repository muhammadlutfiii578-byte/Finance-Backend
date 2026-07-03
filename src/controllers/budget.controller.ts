import { Request, Response, NextFunction } from "express";
import { BudgetService } from "../services/budget.service";
import { ApiResponseBuilder } from "../utils/response";

const budgetService = new BudgetService();

// Frontend mengirim `month` dalam format gabungan "YYYY-MM" (mis. "2026-07"),
// bukan parameter `month` dan `year` terpisah. Helper ini parse format itu.
function parseMonthParam(monthParam: unknown): { month: number; year: number } | null {
  if (typeof monthParam !== "string") return null;
  const match = monthParam.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), month: parseInt(match[2], 10) };
}

export const createBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const result = await budgetService.createBudget(userId, req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getBudgets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const parsed = parseMonthParam(req.query.month);

    const filters = {
      month: parsed?.month ?? (req.query.month ? parseInt(req.query.month as string) : undefined),
      year: parsed?.year ?? (req.query.year ? parseInt(req.query.year as string) : undefined),
      categoryId: req.query.categoryId as string | undefined,
    };

    const result = await budgetService.getUserBudgets(userId, filters);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) {
      return res.status(400).json(
        ApiResponseBuilder.error("Budget ID is required", ["id"])
      );
    }

    const result = await budgetService.updateBudget(id, userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) {
      return res.status(400).json(
        ApiResponseBuilder.error("Budget ID is required", ["id"])
      );
    }

    await budgetService.deleteBudget(id, userId);
    return res.status(200).json(ApiResponseBuilder.success("Budget deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const getBudgetComparison = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const parsed = parseMonthParam(req.query.month);

    const month = parsed?.month ?? (req.query.month ? parseInt(req.query.month as string) : undefined);
    const year = parsed?.year ?? (req.query.year ? parseInt(req.query.year as string) : undefined);

    if (!month || !year) {
      return res.status(400).json(
        ApiResponseBuilder.error("Month and year are required", ["month", "year"])
      );
    }

    const result = await budgetService.getBudgetComparison(userId, month, year);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};