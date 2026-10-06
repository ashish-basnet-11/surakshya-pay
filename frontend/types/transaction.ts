export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";

export interface Transaction {
  id: number;
  amount: number;
  category: string | null;
  description: string | null;
  transaction_type: TransactionType | string;
  user_id: number;
  timestamp: string;
  blockchain_id: string | null;
  from_address: string | null;
  to_address: string | null;
  blockchain_timestamp: number | null;
  is_completed: boolean;
  blockchain_hash: string | null;
}

export interface TransferInput {
  to_username: string;
  amount: number;
  category?: string;
}

export interface SpendingSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  spending_by_category: Record<string, number>;
  transaction_count: number;
  average_transaction_amount: number;
  min_transaction_amount: number;
  max_transaction_amount: number;
  recent_transactions: Pick<Transaction, "id" | "amount" | "category" | "description" | "timestamp" | "transaction_type">[];
}
