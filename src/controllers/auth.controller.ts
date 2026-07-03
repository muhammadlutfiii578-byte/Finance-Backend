import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { ApiResponseBuilder } from "../utils/response";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../validators/auth.validator";

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(
        ApiResponseBuilder.error("Validation failed", parseResult.error.issues.map(issue => issue.message))
      );
    }

    const result = await authService.register(parseResult.data);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(
        ApiResponseBuilder.error("Validation failed", parseResult.error.issues.map(issue => issue.message))
      );
    }

    const result = await authService.login(parseResult.data);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    const result = await authService.getProfile(userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    // Validate request body
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(
        ApiResponseBuilder.error("Validation failed", parseResult.error.issues.map(issue => issue.message))
      );
    }

    const result = await authService.updateProfile(userId, parseResult.data);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(
        ApiResponseBuilder.error("Unauthorized: No user ID", ["unauthorized"])
      );
    }

    // Validate request body
    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(
        ApiResponseBuilder.error("Validation failed", parseResult.error.issues.map(issue => issue.message))
      );
    }

    const result = await authService.changePassword(userId, parseResult.data);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};