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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Colors from "@/constants/Colors"
import { useFocusEffect } from "@react-navigation/native"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

// Mock data
const mockTransactions = [
  {
    id: "1",
    name: "Coffee Shop",
    amount: -4.5,
    category: "Food",
    date: "2024-01-15",
    time: "09:30 AM",
    type: "expense",
    status: "completed",
    description: "Morning coffee and pastry",
  },
  {
    id: "2",
    name: "Monthly Salary",
    amount: 3500.0,
    category: "Income",
    date: "2024-01-15",
    time: "12:00 PM",
    type: "income",
    status: "completed",
    description: "January salary payment",
  },
  {
    id: "3",
    name: "Grocery Store",
    amount: -85.2,
    category: "Food",
    date: "2024-01-14",
    time: "06:45 PM",
    type: "expense",
    status: "completed",
    description: "Weekly grocery shopping",
  },
  {
    id: "4",
    name: "Gas Station",
    amount: -45.0,
    category: "Transport",
    date: "2024-01-14",
    time: "08:15 AM",
    type: "expense",
    status: "pending",
    description: "Fuel for car",
  },
  {
    id: "5",
    name: "Netflix Subscription",
    amount: -15.99,
    category: "Entertainment",
    date: "2024-01-13",
    time: "11:30 PM",
    type: "expense",
    status: "completed",
    description: "Monthly streaming subscription",
  },
  {
    id: "6",
    name: "Freelance Project",
    amount: 750.0,
    category: "Income",
    date: "2024-01-12",
    time: "03:20 PM",
    type: "income",
    status: "completed",
    description: "Web development project",
  },
  {
    id: "7",
    name: "Restaurant Dinner",
    amount: -32.5,
    category: "Food",
    date: "2024-01-12",
    time: "07:45 PM",
    type: "expense",
    status: "failed",
    description: "Dinner with friends",
  },
  {
    id: "8",
    name: "Uber Ride",
    amount: -18.75,
    category: "Transport",
    date: "2024-01-11",
    time: "05:30 PM",
    type: "expense",
    status: "completed",
    description: "Ride to downtown",
  },
]

export default function WalletScreen() {
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState<"all" | "income" | "expense">("all")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name" | "category">("date")
  const [searchQuery, setSearchQuery] = useState("")
  const [showBalance, setShowBalance] = useState(true)
  const [chartType, setChartType] = useState<"line" | "category">("line")

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const balanceAnim = useRef(new Animated.Value(0)).current
  useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      router.replace('/(tabs)'); 
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, [])
);

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

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesFilter = selectedFilter === "all" || transaction.type === selectedFilter
    const matchesSearch =
      transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case "amount":
        return Math.abs(b.amount) - Math.abs(a.amount)
      case "name":
        return a.name.localeCompare(b.name)
      case "category":
        return a.category.localeCompare(b.category)
      default:
        return 0
    }
  })

  const totalBalance = mockTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = mockTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = mockTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const pendingTransactions = mockTransactions.filter((t) => t.status === "pending").length

  const handleExport = () => {
    Alert.alert("Export Transactions", "Choose export format:", [
      { text: "Cancel", style: "cancel" },
      { text: "PDF Report", onPress: () => Alert.alert("Success", "PDF report exported successfully!") },
      { text: "CSV Data", onPress: () => Alert.alert("Success", "CSV data exported successfully!") },
    ])
  }

  const handleRefresh = () => {
    Alert.alert("Success", "Wallet data refreshed!")
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4CAF50"
      case "pending":
        return "#FF9800"
      case "failed":
        return "#F44336"
      default:
        return "#666"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "checkmark-circle"
      case "pending":
        return "time"
      case "failed":
        return "close-circle"
      default:
        return "help-circle"
    }
  }

  const renderLineChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Spending Trend (Last 7 Days)</Text>
      <View style={styles.lineChart}>
        {[120, 85, 150, 95, 180, 110, 140].map((value, index) => (
          <View key={index} style={styles.lineChartBar}>
            <View style={[styles.lineChartBarFill, { height: `${(value / 200) * 100}%` }]} />
            <Text style={styles.lineChartLabel}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderCategoryChart = () => {
    const categories = [
      { name: "Food", amount: 122.2, color: "#FF6B6B" },
      { name: "Transport", amount: 63.75, color: "#4ECDC4" },
      { name: "Entertainment", amount: 47.99, color: "#45B7D1" },
      { name: "Shopping", amount: 89.5, color: "#96CEB4" },
    ]

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Category Breakdown</Text>
        <View style={styles.categoryChart}>
          {categories.map((category) => (
            <View key={category.name} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Text style={styles.categoryAmount}>${category.amount}</Text>
            </View>
          ))}
        </View>
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

        <Text style={styles.headerTitle}>Wallet</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
            <Ionicons name="refresh" size={20} color="#ffffff"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExport} style={styles.headerButton}>
            <Ionicons name="download" size={20} color="#ffffff"/>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
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
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>
                  {showBalance ? `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
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
                <Ionicons name="trending-up" size={16} color="#4CAF50" />
                <Text style={styles.balanceStatLabel}>Income</Text>
              </View>
              <Text style={[styles.balanceStatAmount, { color: "#4CAF50" }]}>+${totalIncome.toLocaleString()}</Text>
            </View>

            <View style={styles.balanceStatDivider} />

            <View style={styles.balanceStat}>
              <View style={styles.balanceStatHeader}>
                <Ionicons name="trending-down" size={16} color="#F44336" />
                <Text style={styles.balanceStatLabel}>Expenses</Text>
              </View>
              <Text style={[styles.balanceStatAmount, { color: "#F44336" }]}>-${totalExpenses.toLocaleString()}</Text>
            </View>

            <View style={styles.balanceStatDivider} />

            <View style={styles.balanceStat}>
              <View style={styles.balanceStatHeader}>
                <Ionicons name="time" size={16} color="#FF9800" />
                <Text style={styles.balanceStatLabel}>Pending</Text>
              </View>
              <Text style={[styles.balanceStatAmount, { color: "#FF9800" }]}>{pendingTransactions}</Text>
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
              placeholder="Search by name or category..."
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
              <Text style={styles.filterGroupLabel}>Filter:</Text>
              {[
                { key: "all", label: "All", icon: "list" },
                { key: "income", label: "Income", icon: "trending-up" },
                { key: "expense", label: "Expense", icon: "trending-down" },
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
              Categories
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/(index)/withdraw")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#4CAF5015" }]}>
                <Ionicons name="send" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.quickActionTitle}>Send Money</Text>
              <Text style={styles.quickActionSubtitle}>Transfer to contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/topup")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#2196F315" }]}>
                <Ionicons name="add-circle" size={24} color="#2196F3" />
              </View>
              <Text style={styles.quickActionTitle}>Top Up</Text>
              <Text style={styles.quickActionSubtitle}>Add funds to wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/scan")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#FF980015" }]}>
                <Ionicons name="qr-code" size={24} color="#FF9800" />
              </View>
              <Text style={styles.quickActionTitle}>Scan & Pay</Text>
              <Text style={styles.quickActionSubtitle}>QR code payments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/(index)/details")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#9C27B015" }]}>
                <Ionicons name="receipt" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.quickActionTitle}>All Transactions</Text>
              <Text style={styles.quickActionSubtitle}>View complete history</Text>
            </TouchableOpacity>
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
            <Text style={styles.summaryTitle}>January Summary</Text>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{mockTransactions.length}</Text>
              <Text style={styles.summaryStatLabel}>Total Transactions</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>
                ${(totalExpenses / mockTransactions.filter((t) => t.type === "expense").length).toFixed(0)}
              </Text>
              <Text style={styles.summaryStatLabel}>Avg. Transaction</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>
                {Math.round(
                  (mockTransactions.filter((t) => t.status === "completed").length / mockTransactions.length) * 100,
                )}
                %
              </Text>
              <Text style={styles.summaryStatLabel}>Success Rate</Text>
            </View>
          </View>

          <Text style={styles.summaryInsight}>
            💡 You've saved 15% more compared to last month. Keep up the great work!
          </Text>
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
            <Text style={styles.sectionTitle}>Recent Activity ({sortedTransactions.length})</Text>
          </View>

          <View style={styles.transactionsList}>
            {sortedTransactions.slice(0, 6).map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => router.push(`/transactions/${transaction.id}`)}
              >
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      { backgroundColor: transaction.type === "income" ? "#4CAF5015" : "#F4433615" },
                    ]}
                  >
                    <Ionicons
                      name={transaction.type === "income" ? "arrow-down" : "arrow-up"}
                      size={16}
                      color={transaction.type === "income" ? "#4CAF50" : "#F44336"}
                    />
                  </View>

                  <View style={styles.transactionDetails}>
                    <View style={styles.transactionNameRow}>
                      <Text style={styles.transactionName}>{transaction.name}</Text>
                      <View style={styles.transactionStatus}>
                        <Ionicons
                          name={getStatusIcon(transaction.status) as any}
                          size={12}
                          color={getStatusColor(transaction.status)}
                        />
                      </View>
                    </View>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionDateTime}>
                      {transaction.date} • {transaction.time}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionRight}>
                  <Text
                    style={[styles.transactionAmount, { color: transaction.type === "income" ? "#4CAF50" : "#F44336" }]}
                  >
                    {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.bottomSpacing}/>
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
  },
  categoryAmount: {
    fontSize: 14,
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
    marginBottom: 2,
  },
  transactionDateTime: {
    fontSize: 11,
    color: "#999",
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
  },
  bottomSpacing: {
    height:120,
  }
})
