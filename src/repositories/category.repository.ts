import prisma from "../config/prisma";
import { Category } from "@prisma/client";

export class CategoryRepository {
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  }

  async findByUserIdAndType(userId: string, type: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId, type },
      orderBy: { name: "asc" },
    });
  }

  async create(data: {
    name: string;
    type: string;
    userId: string;
  }): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: Partial<{ name: string; type: string }>): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }
}