"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  TextInput,
  BackHandler,
  RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Colors from "@/constants/Colors"
import { useFocusEffect } from "@react-navigation/native"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { budgetApi } from "@/apis/budget/budget-api"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export default function BudgetScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "warning" | "completed">("all")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name" | "category">("date")
  const [searchQuery, setSearchQuery] = useState("")
  const [showBalance, setShowBalance] = useState(true)
  const [chartType, setChartType] = useState<"line" | "category">("category")
  const [refreshing, setRefreshing] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const balanceAnim = useRef(new Animated.Value(0)).current

  const { data: budgetSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["budget-summary"],
    queryFn: budgetApi.getBudgetSummary,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: budgetAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["budget-analytics"],
    queryFn: budgetApi.getBudgetAnalytics,
    refetchInterval: 30000,
  })

  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ["budgets", selectedFilter, sortBy],
    queryFn: () => budgetApi.getBudgets({
      status: selectedFilter === "all" ? undefined : selectedFilter,
      sort_by: sortBy === "date" ? "created_at" : sortBy,
      sort_order: "desc",
      limit: 100
    }),
    refetchInterval: 30000,
  })

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["budget-search", searchQuery],
    queryFn: () => budgetApi.searchBudgets(searchQuery),
    enabled: searchQuery.length > 0,
  })

  // Mutations
  const deleteBudgetMutation = useMutation({
    mutationFn: budgetApi.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] })
      queryClient.invalidateQueries({ queryKey: ["budget-analytics"] })
      Alert.alert("Success", "Budget deleted successfully!")
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to delete budget")
    },
  })

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(tabs)")
        return true
      }

      const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress)

      return () => backHandler.remove()
    }, []),
  )

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(balanceAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["budget-summary"] }),
        queryClient.refetchQueries({ queryKey: ["budget-analytics"] }),
        queryClient.refetchQueries({ queryKey: ["budgets"] }),
      ])
    } catch (error) {
      console.error("Refresh failed:", error)
    } finally {
      setRefreshing(false)
    }
  }, [queryClient])

  // Data processing
  const budgets = budgetsData?.data || []
  const summary = budgetSummary?.data
  const analytics = budgetAnalytics?.data
  const categoryProgress = analytics?.category_progress || []
  const trendData = analytics?.trend_data || []

  const filteredBudgets = searchQuery.length > 0 
    ? (searchResults?.data || [])
    : budgets

  const handleExport = () => {
    Alert.alert("Export Budget Report", "Choose export format:", [
      { text: "Cancel", style: "cancel" },
      { text: "PDF Report", onPress: () => Alert.alert("Success", "Budget report exported successfully!") },
      { text: "CSV Data", onPress: () => Alert.alert("Success", "Budget data exported successfully!") },
    ])
  }

  const handleRefresh = () => {
    onRefresh()
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4CAF50"
      case "warning":
        return "#FF9800"
      case "completed":
        return "#2196F3"
      default:
        return "#666"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "checkmark-circle"
      case "warning":
        return "warning"
      case "completed":
        return "checkmark-done"
      default:
        return "help-circle"
    }
  }

  const getBudgetProgress = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100)
  }

  const renderLineChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Budget vs Spending (Last 7 Days)</Text>
      <View style={styles.lineChart}>
        {trendData.slice(0, 7).map((data, index) => (
          <View key={index} style={styles.lineChartBar}>
            <View
              style={[styles.lineChartBarFill, { height: `${(data.budget / 200) * 100}%`, backgroundColor: "#E3F2FD" }]}
            />
            <View
              style={[
                styles.lineChartBarFill,
                { height: `${(data.spent / 200) * 100}%`, position: "absolute", bottom: 0 },
              ]}
            />
            <Text style={styles.lineChartLabel}>
              {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderCategoryChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Budget Progress by Category</Text>
      <View style={styles.categoryChart}>
        {categoryProgress.map((category) => (
          <View key={category.category} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.category}</Text>
            </View>
            <View style={styles.categoryProgress}>
              <View style={styles.categoryProgressBar}>
                <View
                  style={[
                    styles.categoryProgressFill,
                    {
                      width: `${category.progress_percentage}%`,
                      backgroundColor:
                        category.progress_percentage > 90 ? "#F44336" : category.progress_percentage > 75 ? "#FF9800" : "#4CAF50",
                    },
                  ]}
                />
              </View>
              <Text style={styles.categoryAmount}>
                NPR {category.spent_amount.toFixed(2)}/{category.budget_amount.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )

  if (summaryLoading || analyticsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading budget data...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
            <Ionicons name="refresh" size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExport} style={styles.headerButton}>
            <Ionicons name="download" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Budget Overview Card */}
        <Animated.View
          style={[
            styles.balanceCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: balanceAnim }],
            },
          ]}
        >
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>Monthly Budget</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>
                  {showBalance ? `NPR ${summary?.monthly_budget?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}` : "••••••"}
                </Text>
                <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeButton}>
                  <Ionicons name={showBalance ? "eye" : "eye-off"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <View style={styles.balanceStatHeader}>
                <Ionicons name="trending-down" size={16} color="#F44336" />
                <Text style={styles.balanceStatLabel}>Spent</Text>
              </View>
              <Text style={[styles.balanceStatAmount, { color: "#F44336" }]}>
                NPR {summary?.monthly_spent?.toLocaleString() || "0"}
              </Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <View style={styles.balanceStatHeader}>
                <Ionicons name="trending-up" size={16} color="#4CAF50" />
                <Text style={styles.balanceStatLabel}>Remaining</Text>
              </View>
              <Text style={[styles.balanceStatAmount, { color: "#4CAF50" }]}>
                NPR {summary?.monthly_remaining?.toLocaleString() || "0"}
              </Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <View style={styles.balanceStatHeader}>
                <Ionicons name="warning" size={16} color="#FF9800" />
                <Text style={styles.balanceStatLabel}>Alerts</Text>
              </View>
              <Text style={[styles.balanceStatAmount, { color: "#FF9800" }]}>
                {summary?.warning_count || 0}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search budget categories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Filters */}
        <Animated.View
          style={[
            styles.filtersContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>Status:</Text>
              {[
                { key: "all", label: "All", icon: "list" },
                { key: "active", label: "Active", icon: "checkmark-circle" },
                { key: "warning", label: "Warning", icon: "warning" },
                { key: "completed", label: "Completed", icon: "checkmark-done" },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.filterButton, selectedFilter === filter.key && styles.filterButtonActive]}
                  onPress={() => setSelectedFilter(filter.key as any)}
                >
                  <Ionicons
                    name={filter.icon as any}
                    size={14}
                    color={selectedFilter === filter.key ? "white" : Colors.primary}
                  />
                  <Text
                    style={[styles.filterButtonText, selectedFilter === filter.key && styles.filterButtonTextActive]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>Sort:</Text>
              {[
                { key: "date", label: "Date", icon: "calendar" },
                { key: "amount", label: "Amount", icon: "cash" },
                { key: "name", label: "Name", icon: "text" },
                { key: "category", label: "Category", icon: "folder" },
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[styles.filterButton, sortBy === sort.key && styles.filterButtonActive]}
                  onPress={() => setSortBy(sort.key as any)}
                >
                  <Ionicons name={sort.icon as any} size={14} color={sortBy === sort.key ? "white" : Colors.primary} />
                  <Text style={[styles.filterButtonText, sortBy === sort.key && styles.filterButtonTextActive]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Chart Toggle */}
        <Animated.View
          style={[
            styles.chartToggle,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.chartToggleButton, chartType === "line" && styles.chartToggleButtonActive]}
            onPress={() => setChartType("line")}
          >
            <Ionicons name="trending-up" size={16} color={chartType === "line" ? "white" : Colors.primary} />
            <Text style={[styles.chartToggleText, chartType === "line" && styles.chartToggleTextActive]}>Trend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartToggleButton, chartType === "category" && styles.chartToggleButtonActive]}
            onPress={() => setChartType("category")}
          >
            <Ionicons name="pie-chart" size={16} color={chartType === "category" ? "white" : Colors.primary} />
            <Text style={[styles.chartToggleText, chartType === "category" && styles.chartToggleTextActive]}>
              Progress
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Chart */}
        <Animated.View
          style={[
            styles.chartSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {chartType === "line" ? renderLineChart() : renderCategoryChart()}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Budget Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/create-budget")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#4CAF5015" }]}>
                <Ionicons name="add-circle" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.quickActionTitle}>Create Budget</Text>
              <Text style={styles.quickActionSubtitle}>Set new spending limits</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/budget-goals")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#2196F315" }]}>
                <Ionicons name="flag" size={24} color="#2196F3" />
              </View>
              <Text style={styles.quickActionTitle}>Set Goals</Text>
              <Text style={styles.quickActionSubtitle}>Define savings targets</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/budget-alerts")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#FF980015" }]}>
                <Ionicons name="notifications" size={24} color="#FF9800" />
              </View>
              <Text style={styles.quickActionTitle}>Alerts</Text>
              <Text style={styles.quickActionSubtitle}>Manage notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/budget-analysis")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#9C27B015" }]}>
                <Ionicons name="analytics" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.quickActionTitle}>Analysis</Text>
              <Text style={styles.quickActionSubtitle}>Detailed insights</Text>
            </TouchableOpacity> */}
          </View>
        </Animated.View>

        {/* Monthly Summary */}
        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <Ionicons name="analytics" size={24} color={Colors.primary} />
            <Text style={styles.summaryTitle}>Budget Summary</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{summary?.statistics?.total_budgets || 0}</Text>
              <Text style={styles.summaryStatLabel}>Total Budgets</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>
                {Math.round(summary?.statistics?.budget_usage_percentage || 0)}%
              </Text>
              <Text style={styles.summaryStatLabel}>Budget Used</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>
                {Math.round(summary?.statistics?.on_track_percentage || 0)}%
              </Text>
              <Text style={styles.summaryStatLabel}>On Track</Text>
            </View>
          </View>
          <Text style={styles.summaryInsight}>
            💡 You&apos;re staying within budget for {Math.round(summary?.statistics?.on_track_percentage || 0)}% of categories. 
            {summary?.warning_count > 0 ? ` ${summary.warning_count} budget(s) need attention!` : " Keep up the good work!"}
          </Text>
        </Animated.View>

        {/* Budget Categories */}
        <Animated.View
          style={[
            styles.transactionsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget Categories ({filteredBudgets.length})</Text>
          </View>
          <View style={styles.transactionsList}>
            {filteredBudgets.slice(0, 6).map((budget) => {
              const progress = getBudgetProgress(budget.spent_amount, budget.budget_amount)
              return (
                <TouchableOpacity
                  key={budget.id}
                  style={styles.transactionItem}
                  onPress={() => router.push(`/(tabs)/budget-detail?budgetId=${budget.id}`)}
                >
                  <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIcon, { backgroundColor: `${budget.color}15` }]}>
                      <Ionicons name={budget.icon as any} size={16} color={budget.color} />
                    </View>
                    <View style={styles.transactionDetails}>
                      <View style={styles.transactionNameRow}>
                        <Text style={styles.transactionName}>{budget.name}</Text>
                        <View style={styles.transactionStatus}>
                          <Ionicons
                            name={getStatusIcon(budget.status) as any}
                            size={12}
                            color={getStatusColor(budget.status)}
                          />
                        </View>
                      </View>
                      <Text style={styles.transactionDescription}>{budget.description}</Text>
                      <View style={styles.budgetProgressContainer}>
                        <View style={styles.budgetProgressBar}>
                          <View
                            style={[
                              styles.budgetProgressFill,
                              {
                                width: `${progress}%`,
                                backgroundColor: progress > 90 ? "#F44336" : progress > 75 ? "#FF9800" : "#4CAF50",
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.budgetProgressText}>{Math.round(progress)}%</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: "#333" }]}>
                      NPR {budget.spent_amount.toFixed(2)}
                    </Text>
                    <Text style={styles.transactionCategory}>of NPR {budget.budget_amount.toFixed(2)}</Text>
                    <Text
                      style={[
                        styles.transactionRemaining,
                        {
                          color: budget.remaining > 0 ? "#4CAF50" : "#F44336",
                        },
                      ]}
                    >
                      NPR {Math.abs(budget.remaining).toFixed(2)}{" "}
                      {budget.remaining > 0 ? "left" : "over"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={styles.bottomSpacing} />
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  balanceCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginRight: 12,
  },
  eyeButton: {
    padding: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceStat: {
    flex: 1,
    alignItems: "center",
  },
  balanceStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceStatLabel: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  balanceStatAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  balanceStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  filterGroupLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginRight: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 8,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 4,
  },
  filterButtonTextActive: {
    color: "white",
  },
  chartToggle: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  chartToggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  chartToggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  chartToggleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  chartToggleTextActive: {
    color: "white",
  },
  chartSection: {
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  lineChart: {
    flexDirection: "row",
    alignItems: "end",
    justifyContent: "space-between",
    height: 120,
  },
  lineChartBar: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
    position: "relative",
  },
  lineChartBarFill: {
    width: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginBottom: 8,
  },
  lineChartLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  categoryChart: {
    gap: 16,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  categoryProgress: {
    alignItems: "flex-end",
    flex: 1,
  },
  categoryProgressBar: {
    width: 100,
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginBottom: 4,
  },
  categoryProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  categoryAmount: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryStatItem: {
    alignItems: "center",
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  summaryInsight: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  transactionsSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionsList: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  transactionStatus: {
    marginLeft: 8,
  },
  transactionDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  budgetProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  budgetProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    marginRight: 8,
  },
  budgetProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  budgetProgressText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  transactionRemaining: {
    fontSize: 11,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    fontStyle: "italic",
  },
})
