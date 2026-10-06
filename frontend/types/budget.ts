export type BudgetType = "expense" | "savings" | "investment";
export type BudgetStatus = "active" | "warning" | "completed";

export interface Budget {
  id: number;
  name: string;
  description?: string | null;
  category: string;
  budget_amount: number;
  spent_amount: number;
  budget_type: BudgetType;
  status: BudgetStatus;
  color: string;
  icon: string;
  start_date: string;
  end_date?: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  remaining: number;
  progress_percentage: number;
  is_over_budget: boolean;
}

export interface BudgetSummary {
  monthly_budget: number;
  monthly_spent: number;
  monthly_remaining: number;
  warning_count: number;
  statistics: {
    total_budgets: number;
    active_budgets: number;
    warning_budgets: number;
    completed_budgets: number;
    total_budget_amount: number;
    total_spent_amount: number;
    total_remaining_amount: number;
    budget_usage_percentage: number;
    on_track_percentage: number;
  };
}

export interface BudgetInput {
  name: string;
  description?: string | null;
  category: string;
  budget_amount: number;
  budget_type: BudgetType;
  color: string;
  icon: string;
  start_date: string;
  end_date?: string | null;
}
