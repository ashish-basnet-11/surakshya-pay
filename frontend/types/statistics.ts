export interface TransactionSummary {
  id: number;
  amount: number;
  category: string;
  description: string;
  timestamp: string; // ISO format
  transaction_type: "TRANSFER" | "WITHDRAWAL" | "DEPOSIT" | string;
}

export interface SpendingSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  spending_by_category: Record<string, number>; // e.g., { food: 200, transport: 100 }
  transaction_count: number;
  average_transaction_amount: number;
  min_transaction_amount: number;
  max_transaction_amount: number;
  recent_transactions: TransactionSummary[];
}
