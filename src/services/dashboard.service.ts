import { TransactionRepository } from "../repositories/transaction.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { BudgetRepository } from "../repositories/budget.repository";
import { ApiResponseBuilder } from "../utils/response";

export class DashboardService {
  constructor(
    private transactionRepository = new TransactionRepository(),
    private categoryRepository = new CategoryRepository(),
    private budgetRepository = new BudgetRepository()
  ) { }

  async getDashboardSummary(userId: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const transactions = await this.transactionRepository.findByUserId(userId, {
      page: 1,
      limit: 1000,
    });

    const totalIncome = transactions.data
      .filter(t => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions.data
      .filter(t => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpense;

    const monthlyTransactions = await this.transactionRepository.findByUserId(userId, {
      page: 1,
      limit: 1000,
      month: currentMonth,
      year: currentYear,
    });

    const monthlyIncome = monthlyTransactions.data
      .filter(t => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = monthlyTransactions.data
      .filter(t => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseByCategory = this.groupByCategory(transactions.data.filter(t => t.type === "EXPENSE"));
    const incomeByCategory = this.groupByCategory(transactions.data.filter(t => t.type === "INCOME"));

    const recentTransactions = transactions.data
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return ApiResponseBuilder.success("Dashboard summary retrieved successfully", {
      totalBalance,
      monthIncome: monthlyIncome,
      monthExpense: monthlyExpense,
      monthIncomeChangePct: 0,
      monthExpenseChangePct: 0,
      balanceTrend: [],
      expenseByCategory,
      incomeByCategory,
      recentTransactions,
    });
  }

  async getMonthlyReport(userId: string, month: number, year: number) {
    const transactions = await this.transactionRepository.findByUserId(userId, {
      page: 1,
      limit: 1000,
      month,
      year,
    });

    const totalIncome = transactions.data
      .filter(t => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions.data
      .filter(t => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpense;

    const incomeByCategory = this.groupByCategory(transactions.data.filter(t => t.type === "INCOME"));
    const expenseByCategory = this.groupByCategory(transactions.data.filter(t => t.type === "EXPENSE"));

    const monthlyTrend = await this.getMonthlyTrend(userId, year, month);

    return ApiResponseBuilder.success("Monthly report retrieved successfully", {
      month,
      year,
      totalIncome,
      totalExpense,
      netIncome,
      incomeByCategory,
      expenseByCategory,
      monthlyTrend,
    });
  }

  // NEW: untuk halaman Laporan (ReportsPage.tsx), yang butuh array
  // { month: "YYYY-MM", income, expense, net }[] mencakup rentang
  // dateFrom..dateTo — bukan satu bulan tunggal seperti getMonthlyReport().
  async getMonthlyReportRange(userId: string, dateFrom: string, dateTo: string) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const months: { month: number; year: number }[] = [];
    const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 1);

    while (cursor <= end) {
      months.push({ month: cursor.getMonth() + 1, year: cursor.getFullYear() });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const rows = await Promise.all(
      months.map(async ({ month, year }) => {
        const transactions = await this.transactionRepository.findByUserId(userId, {
          page: 1,
          limit: 1000,
          month,
          year,
        });

        const income = transactions.data
          .filter(t => t.type === "INCOME")
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions.data
          .filter(t => t.type === "EXPENSE")
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          month: `${year}-${String(month).padStart(2, "0")}`,
          income,
          expense,
          net: income - expense,
        };
      })
    );

    return ApiResponseBuilder.success("Monthly report retrieved successfully", rows);
  }

  private groupByCategory(items: any[]) {
    return items.reduce((acc, item) => {
      const existing = acc.find((cat: any) => cat.category === item.category);
      if (existing) {
        existing.amount += item.amount;
      } else {
        acc.push({ category: item.category, amount: item.amount });
      }
      return acc;
    }, [] as { category: string; amount: number }[]);
  }

  private async getMonthlyTrend(userId: string, currentYear: number, currentMonth: number) {
    const trend = [];
    const monthsToShow = 6;

    for (let i = 0; i < monthsToShow; i++) {
      let month = currentMonth - i;
      let year = currentYear;

      while (month <= 0) {
        month += 12;
        year--;
      }

      const transactions = await this.transactionRepository.findByUserId(userId, {
        page: 1,
        limit: 1000,
        month,
        year,
      });

      const income = transactions.data
        .filter(t => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions.data
        .filter(t => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      trend.unshift({
        month,
        year,
        income,
        expense,
        net: income - expense,
      });
    }

    return trend;
  }
}