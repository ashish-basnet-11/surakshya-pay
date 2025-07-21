"use client"

import { useState, useRef, useEffect } from "react"
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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Colors from "@/constants/Colors"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

// Mock data
const mockTransactions = [
  { id: "1", name: "Coffee Shop", amount: -4.5, category: "Food", date: "2024-01-15", type: "expense" },
  { id: "2", name: "Salary", amount: 3500.0, category: "Income", date: "2024-01-15", type: "income" },
  { id: "3", name: "Grocery Store", amount: -85.2, category: "Food", date: "2024-01-14", type: "expense" },
  { id: "4", name: "Gas Station", amount: -45.0, category: "Transport", date: "2024-01-14", type: "expense" },
  { id: "5", name: "Netflix", amount: -15.99, category: "Entertainment", date: "2024-01-13", type: "expense" },
  { id: "6", name: "Freelance Work", amount: 750.0, category: "Income", date: "2024-01-12", type: "income" },
  { id: "7", name: "Restaurant", amount: -32.5, category: "Food", date: "2024-01-12", type: "expense" },
  { id: "8", name: "Uber", amount: -18.75, category: "Transport", date: "2024-01-11", type: "expense" },
]

const categoryData = [
  { name: "Food", amount: 122.2, percentage: 35, color: "#FF6B6B", icon: "restaurant" },
  { name: "Transport", amount: 63.75, percentage: 18, color: "#4ECDC4", icon: "car" },
  { name: "Entertainment", amount: 47.99, percentage: 14, color: "#45B7D1", icon: "game-controller" },
  { name: "Shopping", amount: 89.5, percentage: 26, color: "#96CEB4", icon: "bag" },
  { name: "Bills", amount: 25.0, percentage: 7, color: "#FFEAA7", icon: "receipt" },
]

export default function StatisticsScreen() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly">("monthly")
  const [selectedChart, setSelectedChart] = useState<"pie" | "line" | "bar">("pie")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

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
    ]).start()
  }, [])

  useEffect(() => {
    const filtered = mockTransactions.filter(
      (transaction) =>
        transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredTransactions(filtered)
  }, [searchQuery])

  const totalIncome = mockTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = mockTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netBalance = totalIncome - totalExpenses
  const balanceChange = selectedPeriod === "weekly" ? 12.5 : 8.3

  const handleExport = () => {
    Alert.alert("Export Data", "Choose export format:", [
      { text: "Cancel", style: "cancel" },
      { text: "PDF Report", onPress: () => Alert.alert("Success", "PDF report exported successfully!") },
      { text: "CSV Data", onPress: () => Alert.alert("Success", "CSV data exported successfully!") },
    ])
  }

  const handleShare = () => {
    Alert.alert("Success", "Statistics shared successfully!")
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const renderPieChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          {categoryData.map((category, index) => (
            <View
              key={category.name}
              style={[
                styles.pieSlice,
                {
                  backgroundColor: category.color,
                  transform: [{ rotate: `${index * 72}deg` }],
                },
              ]}
            />
          ))}
          <View style={styles.pieCenter}>
            <Text style={styles.pieCenterText}>Total</Text>
            <Text style={styles.pieCenterAmount}>${totalExpenses.toFixed(0)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.chartLegend}>
        {categoryData.map((category) => (
          <View key={category.name} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: category.color }]} />
            <Text style={styles.legendText}>{category.name}</Text>
            <Text style={styles.legendAmount}>${category.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderLineChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.lineChartContainer}>
        <Text style={styles.chartTitle}>Spending Trend</Text>
        <View style={styles.lineChart}>
          {[120, 85, 150, 95, 180, 110, 140].map((value, index) => (
            <View key={index} style={styles.lineChartBar}>
              <View style={[styles.lineChartBarFill, { height: `${(value / 200) * 100}%` }]} />
              <Text style={styles.lineChartLabel}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )

  const renderBarChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Category Breakdown</Text>
      <View style={styles.barChartContainer}>
        {categoryData.map((category) => (
          <View key={category.name} style={styles.barChartItem}>
            <View style={styles.barChartInfo}>
              <Ionicons name={category.icon as any} size={20} color={category.color} />
              <Text style={styles.barChartLabel}>{category.name}</Text>
              <Text style={styles.barChartAmount}>${category.amount}</Text>
            </View>
            <View style={styles.barChartBarContainer}>
              <View
                style={[
                  styles.barChartBar,
                  {
                    width: `${category.percentage}%`,
                    backgroundColor: category.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.barChartPercentage}>{category.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderChart = () => {
    switch (selectedChart) {
      case "pie":
        return renderPieChart()
      case "line":
        return renderLineChart()
      case "bar":
        return renderBarChart()
      default:
        return renderPieChart()
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Statistics</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleExport} style={styles.headerButton}>
            <Ionicons name="download" size={20} color="#ffffff"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              placeholder="Search transactions..."
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

        {/* Balance Overview */}
        <Animated.View
          style={[
            styles.balanceCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>{selectedPeriod === "weekly" ? "This Week" : "This Month"}</Text>
            <View style={styles.balanceChange}>
              <Ionicons
                name={balanceChange > 0 ? "trending-up" : "trending-down"}
                size={16}
                color={balanceChange > 0 ? "#4CAF50" : "#F44336"}
              />
              <Text style={[styles.balanceChangeText, { color: balanceChange > 0 ? "#4CAF50" : "#F44336" }]}>
                {balanceChange > 0 ? "+" : ""}
                {balanceChange}%
              </Text>
            </View>
          </View>

          <Text style={styles.balanceAmount}>
            ${Math.abs(netBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>

          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Income</Text>
              <Text style={[styles.balanceStatAmount, { color: "#4CAF50" }]}>+${totalIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Expenses</Text>
              <Text style={[styles.balanceStatAmount, { color: "#F44336" }]}>-${totalExpenses.toLocaleString()}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Period Filter */}
        <Animated.View
          style={[
            styles.filterContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === "weekly" && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod("weekly")}
          >
            <Ionicons name="calendar" size={16} color={selectedPeriod === "weekly" ? "white" : Colors.primary} />
            <Text style={[styles.filterButtonText, selectedPeriod === "weekly" && styles.filterButtonTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === "monthly" && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod("monthly")}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={selectedPeriod === "monthly" ? "white" : Colors.primary}
            />
            <Text style={[styles.filterButtonText, selectedPeriod === "monthly" && styles.filterButtonTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Chart Type Selector */}
        <Animated.View
          style={[
            styles.chartSelector,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Spending Analysis</Text>
          <View style={styles.chartButtons}>
            {[
              { type: "pie", icon: "pie-chart", label: "Pie" },
              { type: "line", icon: "trending-up", label: "Trend" },
              { type: "bar", icon: "bar-chart", label: "Category" },
            ].map((chart) => (
              <TouchableOpacity
                key={chart.type}
                style={[styles.chartButton, selectedChart === chart.type && styles.chartButtonActive]}
                onPress={() => setSelectedChart(chart.type as any)}
              >
                <Ionicons
                  name={chart.icon as any}
                  size={16}
                  color={selectedChart === chart.type ? "white" : Colors.primary}
                />
                <Text style={[styles.chartButtonText, selectedChart === chart.type && styles.chartButtonTextActive]}>
                  {chart.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
          {renderChart()}
        </Animated.View>

        {/* Financial Insights */}
        <Animated.View
          style={[
            styles.insightsCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.insightsHeader}>
            <Ionicons name="bulb" size={24} color={Colors.primary} />
            <Text style={styles.insightsTitle}>Financial Insights</Text>
          </View>

          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: "#4CAF5015" }]}>
                <Ionicons name="trending-up" size={16} color="#4CAF50" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightText}>Your spending decreased by 15% compared to last month</Text>
                <Text style={styles.insightSubtext}>Great job on budgeting!</Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: "#FF980015" }]}>
                <Ionicons name="restaurant" size={16} color="#FF9800" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightText}>Food expenses are 35% of your total spending</Text>
                <Text style={styles.insightSubtext}>Consider meal planning to save more</Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: "#2196F315" }]}>
                <Ionicons name="card" size={16} color="#2196F3" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightText}>You're on track to save $500 this month</Text>
                <Text style={styles.insightSubtext}>Keep up the excellent work!</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Recent Transactions */}
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
            <Text style={styles.sectionTitle}>Recent Transactions ({filteredTransactions.length})</Text>
            <TouchableOpacity onPress={() => router.push("/transactions")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {filteredTransactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Ionicons
                    name={transaction.type === "income" ? "arrow-down" : "arrow-up"}
                    size={16}
                    color={transaction.type === "income" ? "#4CAF50" : "#F44336"}
                  />
                </View>

                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionName}>{transaction.name}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>

                <View style={styles.transactionAmount}>
                  <Text
                    style={[
                      styles.transactionAmountText,
                      { color: transaction.type === "income" ? "#4CAF50" : "#F44336" },
                    ]}
                  >
                    {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </View>
            ))}
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
    paddingTop: 50,
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
  searchContainer: {
    marginVertical: 20,
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
  balanceCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  balanceChange: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  balanceChangeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceStat: {
    flex: 1,
    alignItems: "center",
  },
  balanceStatLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  balanceStatAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  balanceStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 20,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  filterButtonTextActive: {
    color: "white",
  },
  chartSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  chartButtons: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  chartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  chartButtonActive: {
    backgroundColor: Colors.primary,
  },
  chartButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  chartButtonTextActive: {
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
  pieChartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  pieSlice: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  pieCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  pieCenterText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  pieCenterAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  chartLegend: {
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  lineChartContainer: {
    alignItems: "center",
  },
  lineChart: {
    flexDirection: "row",
    alignItems: "end",
    justifyContent: "space-between",
    height: 150,
    width: "100%",
  },
  lineChartBar: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  lineChartBarFill: {
    width: 20,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    marginBottom: 8,
  },
  lineChartLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  barChartContainer: {
    gap: 16,
  },
  barChartItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  barChartInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
  },
  barChartLabel: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginLeft: 8,
  },
  barChartAmount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  barChartBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginHorizontal: 12,
  },
  barChartBar: {
    height: "100%",
    borderRadius: 4,
  },
  barChartPercentage: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    width: 35,
    textAlign: "right",
  },
  insightsCard: {
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
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  insightsList: {
    gap: 16,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginBottom: 2,
  },
  insightSubtext: {
    fontSize: 12,
    color: "#666",
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
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: "#666",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  bottomSpacing: {
    height: 120,
  },
})
