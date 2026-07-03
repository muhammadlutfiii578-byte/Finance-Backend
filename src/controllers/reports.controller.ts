import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";
import { ApiResponseBuilder } from "../utils/response";

const dashboardService = new DashboardService();

export const getMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ApiResponseBuilder.error("Unauthorized"));
    }

    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json(
        ApiResponseBuilder.error("dateFrom and dateTo are required", ["dateFrom", "dateTo"])
      );
    }

    const result = await dashboardService.getMonthlyReportRange(
      userId,
      dateFrom as string,
      dateTo as string
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};