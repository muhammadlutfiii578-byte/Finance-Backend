import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export class JwtUtil {
  static sign(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verify<T = any>(token: string): T | JwtPayload {
    return jwt.verify(token, JWT_SECRET) as T | JwtPayload;
  }

  static decode(token: string): null | string | JwtPayload {
    return jwt.decode(token);
  }
}