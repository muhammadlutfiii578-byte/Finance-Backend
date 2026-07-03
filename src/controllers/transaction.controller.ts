import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transaction.service";
import { ApiResponseBuilder } from "../utils/response";

const transactionService = new TransactionService();

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const result = await transactionService.createTransaction(userId, req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    // Frontend mengirim sentinel value "all" untuk representasikan "tanpa
    // filter" (misal dropdown "Semua tipe" / "Semua kategori"). Backend
    // perlu menormalisasi "all" menjadi undefined, karena kalau tidak,
    // query Prisma akan mencari where.type = "ALL" / where.category = "all"
    // yang tidak pernah cocok dengan data manapun di database.
    const rawType = req.query.type as string | undefined;
    const rawCategory = (req.query.categoryId ?? req.query.category) as string | undefined;

    const filters = {
      type: rawType && rawType !== "all" ? rawType : undefined,
      category: rawCategory && rawCategory !== "all" ? rawCategory : undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit
        ? parseInt(req.query.limit as string)
        : req.query.pageSize
          ? parseInt(req.query.pageSize as string)
          : undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
    };

    const result = await transactionService.getTransactions(userId, filters);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
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
        ApiResponseBuilder.error("Transaction ID is required", ["id"])
      );
    }

    const result = await transactionService.updateTransaction(id, userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
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
        ApiResponseBuilder.error("Transaction ID is required", ["id"])
      );
    }

    await transactionService.deleteTransaction(id, userId);
    return res.status(200).json(ApiResponseBuilder.success("Transaction deleted successfully"));
  } catch (error) {
    next(error);
  }
};