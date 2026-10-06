import { IconName } from "@/components/ui";
import { BudgetType } from "@/types/budget";

export interface CategoryPreset {
  value: string;
  color: string;
  icon: IconName;
}

export const categoryPresets: Record<BudgetType, CategoryPreset[]> = {
  expense: [
    { value: "Food & Dining", color: "#EF4444", icon: "restaurant" },
    { value: "Transportation", color: "#0EA5E9", icon: "car" },
    { value: "Shopping", color: "#10B981", icon: "bag" },
    { value: "Bills & Utilities", color: "#F59E0B", icon: "receipt" },
    { value: "Entertainment", color: "#8B5CF6", icon: "game-controller" },
    { value: "Healthcare", color: "#EC4899", icon: "medical" },
    { value: "Education", color: "#4F46E5", icon: "school" },
    { value: "Travel", color: "#14B8A6", icon: "airplane" },
    { value: "Home", color: "#B45309", icon: "home" },
    { value: "Personal Care", color: "#F97316", icon: "cut" },
  ],
  savings: [
    { value: "Emergency Fund", color: "#F59E0B", icon: "shield" },
    { value: "Vacation", color: "#8B5CF6", icon: "airplane" },
    { value: "Home Purchase", color: "#0EA5E9", icon: "home" },
    { value: "Vehicle", color: "#EF4444", icon: "car" },
    { value: "Education", color: "#4F46E5", icon: "school" },
    { value: "Wedding", color: "#EC4899", icon: "heart" },
    { value: "Retirement", color: "#64748B", icon: "time" },
  ],
  investment: [
    { value: "Stocks", color: "#10B981", icon: "trending-up" },
    { value: "Business", color: "#B45309", icon: "briefcase" },
    { value: "Fixed Deposit", color: "#0EA5E9", icon: "lock-closed" },
    { value: "Crypto", color: "#8B5CF6", icon: "logo-bitcoin" },
  ],
};

export const budgetColors = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#64748B"];

export const budgetIcons: IconName[] = [
  "wallet",
  "restaurant",
  "car",
  "bag",
  "receipt",
  "game-controller",
  "medical",
  "school",
  "airplane",
  "home",
  "cut",
  "shield",
  "heart",
  "briefcase",
  "trending-up",
  "gift",
  "fitness",
  "time",
];

export const typeLabels: Record<BudgetType, string> = { expense: "Spending limit", savings: "Savings goal", investment: "Investment" };
