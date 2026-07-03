import { ApiResponseBuilder } from "../utils/response";
import { PasswordUtil } from "../utils/password";
import { AuthRepository } from "../repositories/auth.repository";

export class AuthService {
  constructor(private authRepository = new AuthRepository()) { }

  async register(data: {
    email: string;
    password: string;
    name: string;
  }) {
    // Check if user already exists
    const existingUser = await this.authRepository.findByEmail(data.email);

    if (existingUser) {
      return ApiResponseBuilder.error("Email is already in use", ["email"]);
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(data.password);

    // Create user
    const user = await this.authRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    // Generate token
    const token = require("../utils/jwt").JwtUtil.sign({
      id: user.id,
      email: user.email,
    });

    const { password: _, ...userWithoutPassword } = user;

    return ApiResponseBuilder.success("User registered successfully", {
      user: userWithoutPassword,
      token,
    });
  }

  async login(data: { email: string; password: string }) {
    console.log("\n========== LOGIN DEBUG ==========");
    console.log("Email Input :", data.email);

    // Find user
    const user = await this.authRepository.findByEmail(data.email);

    console.log("User Found  :", user);

    if (!user) {
      console.log("❌ User tidak ditemukan");
      console.log("================================\n");

      return ApiResponseBuilder.error("Invalid email or password", [
        "email",
        "password",
      ]);
    }

    console.log("Password Hash:", user.password);

    // Check password
    const isValidPassword = await PasswordUtil.compare(
      data.password,
      user.password
    );

    console.log("Password Valid:", isValidPassword);

    if (!isValidPassword) {
      console.log("❌ Password tidak cocok");
      console.log("================================\n");

      return ApiResponseBuilder.error("Invalid email or password", [
        "email",
        "password",
      ]);
    }

    console.log("✅ Login Berhasil");

    // Generate token
    const token = require("../utils/jwt").JwtUtil.sign({
      id: user.id,
      email: user.email,
    });

    const { password: _, ...userWithoutPassword } = user;

    console.log("Token:", token);
    console.log("================================\n");

    return ApiResponseBuilder.success("Login successful", {
      user: userWithoutPassword,
      token,
    });
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      return ApiResponseBuilder.error("User not found");
    }

    const { password: _, ...userWithoutPassword } = user;

    return ApiResponseBuilder.success(
      "User profile retrieved",
      userWithoutPassword
    );
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string }
  ) {
    if (data.email) {
      const existingUser = await this.authRepository.findByEmail(data.email);

      if (existingUser && existingUser.id !== userId) {
        return ApiResponseBuilder.error("Email is already in use", ["email"]);
      }
    }

    const user = await this.authRepository.update(userId, data);

    const { password: _, ...userWithoutPassword } = user;

    return ApiResponseBuilder.success(
      "Profile updated successfully",
      userWithoutPassword
    );
  }

  async changePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string }
  ) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      return ApiResponseBuilder.error("User not found");
    }

    const isValidPassword = await PasswordUtil.compare(
      data.currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return ApiResponseBuilder.error(
        "Current password is incorrect",
        ["currentPassword"]
      );
    }

    const hashedPassword = await PasswordUtil.hash(data.newPassword);

    await this.authRepository.updatePassword(userId, hashedPassword);

    return ApiResponseBuilder.success("Password changed successfully");
  }
}