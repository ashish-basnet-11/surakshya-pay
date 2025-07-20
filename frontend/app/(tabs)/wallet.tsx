import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Colors from "@/constants/Colors";
import { BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;

const transactions = [
  {
    id: 1,
    name: "Dribble Premium",
    date: "20 Dec 2024",
    time: "10:00 AM",
    amount: -280,
    category: "Design Tools",
    type: "subscription",
    icon: "brush",
    color: "#FF6B6B",
  },
  {
    id: 2,
    name: "Snapchat Ads Revenue",
    date: "18 Dec 2024",
    time: "12:00 PM",
    amount: +220,
    category: "Advertising",
    type: "income",
    icon: "trending-up",
    color: "#4ECDC4",
  },
  {
    id: 3,
    name: "Skype Premium",
    date: "15 Dec 2024",
    time: "08:00 AM",
    amount: -190,
    category: "Communication",
    type: "subscription",
    icon: "call",
    color: "#45B7D1",
  },
  {
    id: 4,
    name: "Freelance Project",
    date: "12 Dec 2024",
    time: "03:30 PM",
    amount: +850,
    category: "Work",
    type: "income",
    icon: "briefcase",
    color: "#96CEB4",
  },
  {
    id: 5,
    name: "Netflix Subscription",
    date: "10 Dec 2024",
    time: "11:45 AM",
    amount: -15.99,
    category: "Entertainment",
    type: "subscription",
    icon: "play-circle",
    color: "#FFEAA7",
  },
];

const chartData = {
  labels: transactions.slice(0, 3).map((t) => t.name.split(" ")[0]),
  datasets: [
    {
      data: transactions.slice(0, 3).map((t) => Math.abs(t.amount)),
    },
  ],
};

const WalletScreen = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "income") return transaction.amount > 0;
    if (selectedFilter === "expense") return transaction.amount < 0;
    return true;
  });

  const getTransactionIcon = (iconName) => {
    return <Ionicons name={iconName} size={24} color="#FFFFFF" />;
  };

  const filters = [
    { id: "all", label: "All", count: transactions.length },
    { id: "income", label: "Income", count: transactions.filter(t => t.amount > 0).length },
    { id: "expense", label: "Expenses", count: transactions.filter(t => t.amount < 0).length },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Cards */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewCard}>
              <View style={styles.overviewIcon}>
                <Ionicons name="arrow-up" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.overviewLabel}>Total Income</Text>
              <Text style={styles.overviewAmount}>+${totalIncome.toFixed(2)}</Text>
            </View>
            
            <View style={styles.overviewCard}>
              <View style={styles.overviewIcon}>
                <Ionicons name="arrow-down" size={20} color="#F44336" />
              </View>
              <Text style={styles.overviewLabel}>Total Expenses</Text>
              <Text style={styles.overviewAmount}>-${totalExpenses.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filter Transactions</Text>
          <View style={styles.filtersContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}>
                  {filter.label}
                </Text>
                <View style={[
                  styles.filterBadge,
                  selectedFilter === filter.id && styles.filterBadgeActive,
                ]}>
                  <Text style={[
                    styles.filterBadgeText,
                    selectedFilter === filter.id && styles.filterBadgeTextActive,
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionsContainer}>
            {filteredTransactions.map((transaction, index) => (
              <TouchableOpacity 
                key={transaction.id} 
                style={[
                  styles.transactionItem,
                  index === filteredTransactions.length - 1 && styles.lastTransaction
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIcon, 
                    { backgroundColor: transaction.color }
                  ]}>
                    {getTransactionIcon(transaction.icon)}
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionName}>{transaction.name}</Text>
                    <View style={styles.transactionMeta}>
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                      <Text style={styles.transactionTime}> • {transaction.time}</Text>
                    </View>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.amount > 0 ? "#4CAF50" : "#F44336" }
                  ]}>
                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                  <View style={[
                    styles.transactionType,
                    { backgroundColor: transaction.amount > 0 ? "#4CAF5020" : "#F4433620" }
                  ]}>
                    <Text style={[
                      styles.transactionTypeText,
                      { color: transaction.amount > 0 ? "#4CAF50" : "#F44336" }
                    ]}>
                      {transaction.type}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Spending Analysis</Text>
          <View style={styles.chartContainer}>
            <Text style={styles.chartSubtitle}>Top Categories This Month</Text>
            <BarChart
              data={chartData}
              width={screenWidth - 80}
              height={200}
              yAxisLabel="$"
              fromZero
              withInnerLines={false}
              showBarTops={false}
              chartConfig={{
                backgroundGradientFrom: "#2A3441",
                backgroundGradientTo: "#2A3441",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: () => "#FFFFFF",
                fillShadowGradient: "#4CAF50",
                fillShadowGradientOpacity: 0.8,
                propsForBackgroundLines: {
                  stroke: "rgba(255,255,255,0.1)",
                },
              }}
              style={styles.chart}
              verticalLabelRotation={0}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#4CAF50" }]}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Add Income</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#F44336" }]}>
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#2196F3" }]}>
                <Ionicons name="download" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Export Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginRight:   130,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  overviewSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  overviewRow: {
    flexDirection: "row",
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: "#2A3441",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  overviewLabel: {
    fontSize: 14,
    color: "#ccc",
    fontWeight: "500",
    marginBottom: 8,
  },
  overviewAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A3441",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B9DC3",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B9DC3",
  },
  filterBadgeTextActive: {
    color: "#FFFFFF",
  },
  transactionsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  transactionsContainer: {
    backgroundColor: "#2A3441",
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  lastTransaction: {
    borderBottomWidth: 0,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  transactionTime: {
    fontSize: 14,
    color: "#ccc",
  },
  transactionDate: {
    fontSize: 12,
    color: "#888",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  transactionType: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  transactionTypeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  chartContainer: {
    backgroundColor: "#2A3441",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  chartSubtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 16,
    textAlign: "center",
  },
  chart: {
    borderRadius: 16,
    marginTop: 8,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  quickActionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: "#2A3441",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});

export default WalletScreen;