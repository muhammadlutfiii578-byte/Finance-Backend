import { TransactionRepository } from "../repositories/transaction.repository";
import { ApiResponseBuilder } from "../utils/response";

export class TransactionService {
  constructor(private transactionRepository = new TransactionRepository()) { }

  async createTransaction(userId: string, data: {
    amount: number;
    type: string;
    category?: string;
    date: string;
    note?: string;
    categoryId?: string;
  }) {
    // Frontend mengirim `categoryId`, bukan `category`. Kolom `category` di
    // tabel Transaction bersifat required dan (sesuai konvensi yang sudah
    // dipakai di budget.repository.ts) menyimpan categoryId dalam bentuk
    // string, bukan nama kategori. Jadi kalau `category` tidak dikirim,
    // fallback ke `categoryId`.
    const categoryValue = data.category ?? data.categoryId;

    if (!categoryValue) {
      return ApiResponseBuilder.error("Category is required", ["category"]);
    }

    const transaction = await this.transactionRepository.create({
      amount: data.amount,
      type: data.type.toUpperCase(),
      category: categoryValue,
      date: new Date(data.date),
      note: data.note,
      userId: userId,
    });

    return ApiResponseBuilder.success("Transaction created successfully", transaction);
  }

  async getTransactions(userId: string, filters: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}) {
    const transactions = await this.transactionRepository.findByUserId(userId, {
      page: filters.page,
      limit: filters.limit,
      type: filters.type?.toUpperCase(),
      category: filters.category,
      startDate: filters.startDate,
      endDate: filters.endDate,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

    return ApiResponseBuilder.success("Transactions retrieved successfully", transactions);
  }

  async updateTransaction(id: string, userId: string, data: {
    amount?: number;
    type?: string;
    category?: string;
    date?: string;
    note?: string;
    categoryId?: string;
  }) {
    // First check if transaction belongs to user
    const existing = await this.transactionRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      return ApiResponseBuilder.error("Transaction not found or unauthorized", ["id"]);
    }

    const categoryValue = data.category ?? data.categoryId;

    const transaction = await this.transactionRepository.update(id, {
      amount: data.amount,
      type: data.type?.toUpperCase(),
      category: categoryValue,
      date: data.date ? new Date(data.date) : undefined,
      note: data.note,
    });

    return ApiResponseBuilder.success("Transaction updated successfully", transaction);
  }

  async deleteTransaction(id: string, userId: string) {
    // First check if transaction belongs to user
    const existing = await this.transactionRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      return ApiResponseBuilder.error("Transaction not found or unauthorized", ["id"]);
    }

    await this.transactionRepository.delete(id);
    return ApiResponseBuilder.success("Transaction deleted successfully");
  }
}