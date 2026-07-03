import { BudgetRepository } from "../repositories/budget.repository";
import { ApiResponseBuilder } from "../utils/response";

export class BudgetService {
  constructor(private budgetRepository = new BudgetRepository()) {}

  async createBudget(userId: string, data: {
    amount: number;
    month: number;
    year: number;
    categoryId: string;
  }) {
    // Check if budget already exists for this user/month/year/category
    const existing = await this.budgetRepository.findByUserId(userId, {
      month: data.month,
      year: data.year,
      categoryId: data.categoryId,
    });

    if (existing.length > 0) {
      return ApiResponseBuilder.error("Budget already exists for this month/year/category", [
        "month",
        "year",
        "categoryId",
      ]);
    }

    const budget = await this.budgetRepository.create({
      amount: data.amount,
      month: data.month,
      year: data.year,
      userId: userId,
      categoryId: data.categoryId,
    });

    return ApiResponseBuilder.success("Budget created successfully", budget);
  }

  async getUserBudgets(userId: string, filters: {
    month?: number;
    year?: number;
    categoryId?: string;
  } = {}) {
    const budgets = await this.budgetRepository.findByUserId(userId, filters);
    return ApiResponseBuilder.success("Budgets retrieved successfully", budgets);
  }

  async updateBudget(id: string, userId: string, data: {
    amount?: number;
    month?: number;
    year?: number;
  }) {
    // First check if budget belongs to user
    const existing = await this.budgetRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      return ApiResponseBuilder.error("Budget not found or unauthorized", ["id"]);
    }

    const budget = await this.budgetRepository.update(id, data);
    return ApiResponseBuilder.success("Budget updated successfully", budget);
  }

  async deleteBudget(id: string, userId: string) {
    // First check if budget belongs to user
    const existing = await this.budgetRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      return ApiResponseBuilder.error("Budget not found or unauthorized", ["id"]);
    }

    await this.budgetRepository.delete(id);
    return ApiResponseBuilder.success("Budget deleted successfully");
  }

  async getBudgetComparison(userId: string, month: number, year: number) {
    const comparison = await this.budgetRepository.getBudgetComparison(userId, month, year);
    return ApiResponseBuilder.success("Budget comparison retrieved successfully", comparison);
  }
}