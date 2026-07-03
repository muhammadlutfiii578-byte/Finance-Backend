import prisma from "../config/prisma";
import { Budget } from "@prisma/client";

export class BudgetRepository {
  async findById(id: string): Promise<Budget | null> {
    return prisma.budget.findUnique({ where: { id } });
  }

  async findByUserId(
    userId: string,
    filters: {
      month?: number;
      year?: number;
      categoryId?: string;
    } = {}
  ): Promise<Budget[]> {
    const where: any = { userId };

    if (filters.month) {
      where.month = filters.month;
    }

    if (filters.year) {
      where.year = filters.year;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    return prisma.budget.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    amount: number;
    month: number;
    year: number;
    userId: string;
    categoryId: string;
  }): Promise<Budget> {
    return prisma.budget.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: Partial<{
    amount: number;
    month: number;
    year: number;
  }>): Promise<Budget> {
    return prisma.budget.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string): Promise<Budget> {
    return prisma.budget.delete({
      where: { id },
    });
  }

  async getBudgetComparison(userId: string, month: number, year: number): Promise<{
    budget: Budget[];
    expenses: { categoryId: string; amount: number }[];
  }> {
    const budgets = await this.findByUserId(userId, { month, year });

    // Get expenses for the month grouped by category
    const expensesResult = await prisma.transaction.groupBy({
      by: ["category"],
      where: {
        userId,
        type: "EXPENSE",
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Transform the result to match the expected format
    const expenses = expensesResult.map((expense) => ({
      categoryId: expense.category, // Map category field to categoryId for compatibility
      amount: expense._sum.amount || 0,
    }));

    return { budget: budgets, expenses };
  }
}