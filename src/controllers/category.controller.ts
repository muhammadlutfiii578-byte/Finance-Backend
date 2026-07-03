import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { ApiResponseBuilder } from "../utils/response";
import { categorySchema } from "../validators/category.validator";

const categoryService = new CategoryService();

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    // Validate request body
    const parseResult = categorySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(
        ApiResponseBuilder.error("Validation failed", parseResult.error.issues.map(issue => issue.message))
      );
    }

    const result = await categoryService.createUserCategory(userId, parseResult.data);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const type = req.query.type as string | undefined;
    const result = await categoryService.getUserCategories(userId, type);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const { id } = req.params;
    const categoryId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
    if (!categoryId) {
      return res.status(400).json(
        ApiResponseBuilder.error("Category ID is required", ["id"])
      );
    }

    // Validate request body
    const parseResult = categorySchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(
        ApiResponseBuilder.error("Validation failed", parseResult.error.issues.map(issue => issue.message))
      );
    }

    const result = await categoryService.updateCategory(categoryId, userId, parseResult.data);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const { id } = req.params;
    const categoryId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
    if (!categoryId) {
      return res.status(400).json(
        ApiResponseBuilder.error("Category ID is required", ["id"])
      );
    }

    await categoryService.deleteCategory(categoryId, userId);
    return res.status(200).json(ApiResponseBuilder.success("Category deleted successfully"));
  } catch (error) {
    next(error);
  }
};