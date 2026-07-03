import { CategoryRepository } from "../repositories/category.repository";
import { ApiResponseBuilder } from "../utils/response";

export class CategoryService {
  constructor(private categoryRepository = new CategoryRepository()) {}

  async createUserCategory(userId: string, data: { name: string; type: string }) {
    const category = await this.categoryRepository.create({
      name: data.name,
      type: data.type,
      userId,
    });

    return ApiResponseBuilder.success("Category created successfully", category);
  }

  async getUserCategories(userId: string, type?: string) {
    if (type) {
      const categories = await this.categoryRepository.findByUserIdAndType(userId, type);
      return ApiResponseBuilder.success("Categories retrieved successfully", categories);
    } else {
      const categories = await this.categoryRepository.findByUserId(userId);
      return ApiResponseBuilder.success("Categories retrieved successfully", categories);
    }
  }

  async updateCategory(id: string, userId: string, data: { name?: string; type?: string }) {
    // First check if category belongs to user
    const existing = await this.categoryRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      return ApiResponseBuilder.error("Category not found or unauthorized", ["id"]);
    }

    const category = await this.categoryRepository.update(id, data);
    return ApiResponseBuilder.success("Category updated successfully", category);
  }

  async deleteCategory(id: string, userId: string) {
    // First check if category belongs to user
    const existing = await this.categoryRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      return ApiResponseBuilder.error("Category not found or unauthorized", ["id"]);
    }

    await this.categoryRepository.delete(id);
    return ApiResponseBuilder.success("Category deleted successfully");
  }
}