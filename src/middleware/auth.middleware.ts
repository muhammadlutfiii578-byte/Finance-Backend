import { Request, Response, NextFunction } from "express";
import { JwtUtil } from "../utils/jwt";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
        errors: ["Authentication token is required"],
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = JwtUtil.verify(token);

    // Attach user info to request object
    req.user = {
      id: (decoded as any).id,
      email: (decoded as any).email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
      errors: ["Invalid or expired token"],
    });
  }
};