import prisma from "../config/prisma";
import { Transaction } from "@prisma/client";

export class TransactionRepository {
  async findById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({ where: { id } });
  }

  async findByUserId(
    userId: string,
    filters: {
      type?: string;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      month?: number;
      year?: number;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<{ data: Transaction[]; total: number }> {
    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    // Handle month/year filtering
    if (filters.month && filters.year) {
      where.date = {
        gte: new Date(filters.year, filters.month - 1, 1),
        lt: new Date(filters.year, filters.month, 1),
      };
    } else {
      // Handle date range filtering if month/year not specified
      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.date.lte = filters.endDate;
        }
      }
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: {
          [filters.sortBy ?? "date"]: filters.sortOrder ?? "desc",
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data, total };
  }

  async create(data: {
    userId: string;
    amount: number;
    type: string;
    category: string;
    date: Date;
    note?: string;
  }): Promise<Transaction> {
    return prisma.transaction.create({
      data,
    });
  }

  async update(id: string, data: Partial<{
    amount: number;
    type: string;
    category: string;
    date: Date;
    note: string;
  }>): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Transaction> {
    return prisma.transaction.delete({
      where: { id },
    });
  }
}