import api from "@/config/api"

export interface Budget {
  id: number
  name: string
  description?: string
  category: string
  budget_amount: number
  spent_amount: number
  budget_type: "expense" | "savings" | "investment"
  status: "active" | "warning" | "completed"
  color: string
  icon: string
  start_date: string
  end_date?: string
  user_id: number
  created_at: string
  updated_at: string
  remaining: number
  progress_percentage: number
  is_over_budget: boolean
}

export interface BudgetSummary {
  monthly_budget: number
  monthly_spent: number
  monthly_remaining: number
  warning_count: number
  statistics: {
    total_budgets: number
    active_budgets: number
    warning_budgets: number
    completed_budgets: number
    total_budget_amount: number
    total_spent_amount: number
    total_remaining_amount: number
    budget_usage_percentage: number
    on_track_percentage: number
  }
}

export interface BudgetAnalytics {
  category_progress: Array<{
    category: string
    budget_amount: number
    spent_amount: number
    progress_percentage: number
    color: string
    is_over_budget: boolean
  }>
  trend_data: Array<{
    date: string
    budget: number
    spent: number
  }>
  summary: BudgetSummary
}

export interface BudgetCreate {
  name: string
  description?: string
  category: string
  budget_amount: number
  budget_type?: "expense" | "savings" | "investment"
  color?: string
  icon?: string
  start_date: string
  end_date?: string
}

export interface BudgetUpdate {
  name?: string
  description?: string
  category?: string
  budget_amount?: number
  budget_type?: "expense" | "savings" | "investment"
  color?: string
  icon?: string
  start_date?: string
  end_date?: string
}

// API functions for budget management
export const budgetApi = {
  // Get all budgets with optional filtering
  getBudgets: async (params?: {
    status?: string
    category?: string
    budget_type?: string
    sort_by?: string
    sort_order?: string
    skip?: number
    limit?: number
  }) => {
    const response = await api.get("/budgets/", { params })
    return response.data
  },

  // Get budget summary and overview
  getBudgetSummary: async () => {
    const response = await api.get("/budgets/summary/overview")
    return response.data
  },

  // Get comprehensive budget analytics
  getBudgetAnalytics: async () => {
    const response = await api.get("/budgets/analytics/complete")
    return response.data
  },

  // Get category progress
  getCategoryProgress: async (limit: number = 5) => {
    const response = await api.get(`/budgets/analytics/category-progress?limit=${limit}`)
    return response.data
  },

  // Get trend data
  getTrendData: async (days: number = 7) => {
    const response = await api.get(`/budgets/analytics/trend?days=${days}`)
    return response.data
  },

  // Search budgets
  searchBudgets: async (query: string, skip?: number, limit?: number) => {
    const response = await api.get(`/budgets/search?query=${query}&skip=${skip || 0}&limit=${limit || 100}`)
    return response.data
  },

  // Get specific budget
  getBudget: async (id: number) => {
    const response = await api.get(`/budgets/${id}`)
    return response.data
  },

  // Create new budget
  createBudget: async (budgetData: BudgetCreate) => {
    // Format the data for backend compatibility
    const formattedData = {
      ...budgetData,
      start_date: budgetData.start_date,
      end_date: budgetData.end_date || null,
      budget_amount: Number(budgetData.budget_amount),
    }
    console.log("Formatted budget data:", formattedData)
    const response = await api.post("/budgets/", formattedData)
    return response.data
  },

  // Update budget
  updateBudget: async (id: number, budgetData: BudgetUpdate) => {
    // Format the data for backend compatibility
    const formattedData = {
      ...budgetData,
      end_date: budgetData.end_date || null,
      budget_amount: budgetData.budget_amount ? Number(budgetData.budget_amount) : undefined,
    }
    const response = await api.put(`/budgets/${id}`, formattedData)
    return response.data
  },

  // Delete budget
  deleteBudget: async (id: number) => {
    const response = await api.delete(`/budgets/${id}`)
    return response.data
  },

  // Update budget spent amount
  updateBudgetSpent: async (id: number, amount: number) => {
    const response = await api.post(`/budgets/${id}/update-spent?amount=${amount}`)
    return response.data
  },

  // Get available statuses
  getAvailableStatuses: async () => {
    const response = await api.get("/budgets/filters/status")
    return response.data
  },

  // Get available types
  getAvailableTypes: async () => {
    const response = await api.get("/budgets/filters/types")
    return response.data
  },

  // Get available categories
  getAvailableCategories: async () => {
    const response = await api.get("/budgets/filters/categories")
    return response.data
  },
} 