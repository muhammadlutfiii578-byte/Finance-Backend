import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  type: z.enum(["income", "expense"], { message: "Type must be either 'income' or 'expense'" }),
  category: z.string().min(1, "Category is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  note: z.string().optional(),
});

export const transactionIdSchema = z.object({
  id: z.string().uuid("Invalid transaction ID"),
});