import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";
import { ApiResponseBuilder } from "../utils/response";

const dashboardService = new DashboardService();

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const result = await dashboardService.getDashboardSummary(userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json(
        ApiResponseBuilder.error("Month and year are required", ["month", "year"])
      );
    }

    const result = await dashboardService.getMonthlyReport(
      userId,
      parseInt(month as string),
      parseInt(year as string)
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};