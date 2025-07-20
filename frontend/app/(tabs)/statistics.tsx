import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";

const screenWidth = Dimensions.get("window").width;

const weeklyTransactions = [
  { id: 1, name: "Dribble Premium", amount: -80, type: "Subscription", category: "Software" },
  { id: 2, name: "Snapchat Ads", amount: 150, type: "Income", category: "Marketing" },
  { id: 3, name: "Skype Premium", amount: -70, type: "Subscription", category: "Communication" },
];

const monthlyTransactions = [
  { id: 1, name: "Dribble Premium", amount: -280, type: "Subscription", category: "Software" },
  { id: 2, name: "Snapchat Ads", amount: 220, type: "Income", category: "Marketing" },
  { id: 3, name: "Skype Premium", amount: -190, type: "Subscription", category: "Communication" },
];

const Statistics = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");

  const transactions =
    selectedPeriod === "weekly" ? weeklyTransactions : monthlyTransactions;

  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netBalance = income - expense;

  const chartData = [
    {
      name: "Income",
      amount: income,
      color: "#34C759",
      legendFontColor: "#fff",
      legendFontSize: 14,
    },
    {
      name: "Expenses",
      amount: expense,
      color: "#FF3B30",
      legendFontColor: "#fff",
      legendFontSize: 14,
    },
  ];

  const getTransactionIcon = (type) => {
    return type === "Income" ? "trending-up" : "trending-down";
  };

  const getTransactionColor = (amount) => {
    return amount > 0 ? "#34C759" : "#FF3B30";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistics</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Cards */}
        <View style={styles.overviewSection}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Net Balance</Text>
              <View style={[
                styles.balanceIndicator, 
                { backgroundColor: netBalance >= 0 ? '#34C759' : '#FF3B30' }
              ]}>
                <Ionicons 
                  name={netBalance >= 0 ? "trending-up" : "trending-down"} 
                  size={16} 
                  color="#FFFFFF" 
                />
              </View>
            </View>
            <Text style={[
              styles.balanceAmount,
              { color: netBalance >= 0 ? '#34C759' : '#FF3B30' }
            ]}>
              ${Math.abs(netBalance).toFixed(2)}
            </Text>
            <Text style={styles.balanceSubtext}>
              {netBalance >= 0 ? 'Profit this period' : 'Loss this period'}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: '#34C759' }]}>
                  <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.statLabel}>Income</Text>
              </View>
              <Text style={styles.statAmount}>${income.toFixed(2)}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: '#FF3B30' }]}>
                  <Ionicons name="arrow-down" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.statLabel}>Expenses</Text>
              </View>
              <Text style={styles.statAmount}>${expense.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Period Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <View style={styles.filterContainer}>
            {['weekly', 'monthly'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.filterButton,
                  selectedPeriod === period && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.filterText,
                  selectedPeriod === period && styles.filterTextActive,
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Spending Overview</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={screenWidth - 80}
              height={200}
              chartConfig={{
                color: () => "#1C1C1E",
                backgroundColor: "transparent",
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              hasLegend={true}
            />
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.transactionsContainer}>
            {transactions.map((transaction, index) => (
              <View 
                key={transaction.id} 
                style={[
                  styles.transactionItem,
                  index === transactions.length - 1 && styles.lastTransaction
                ]}
              >
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: getTransactionColor(transaction.amount) + '20' }
                  ]}>
                    <Ionicons 
                      name={getTransactionIcon(transaction.type)} 
                      size={20} 
                      color={getTransactionColor(transaction.amount)} 
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionName}>{transaction.name}</Text>
                    <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  </View>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: getTransactionColor(transaction.amount) }
                ]}>
                  {transaction.amount > 0 ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <View style={styles.categoryContainer}>
            {['Income', 'Subscription'].map((category) => {
              const categorySum = transactions
                .filter((t) => t.type === category)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
              
              const percentage = Math.min(
                ((categorySum / (income + expense)) * 100) || 0,
                100
              );

              return (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.categoryAmount}>${categorySum.toFixed(2)}</Text>
                  </View>
                  <View style={styles.categoryBarContainer}>
                    <View style={styles.categoryBarBackground}>
                      <View
                        style={[
                          styles.categoryBarFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: category === "Income" ? "#34C759" : "#FF3B30",
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 150,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  overviewSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  balanceCard: {
    backgroundColor: '#2A3441',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '500',
  },
  balanceIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -1,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2A3441',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '500',
  },
  statAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A3441',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B9DC3',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  chartContainer: {
    backgroundColor: '#2A3441',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  transactionsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  transactionsContainer: {
    backgroundColor: '#2A3441',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  lastTransaction: {
    borderBottomWidth: 0,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#ccc',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  categorySection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  categoryContainer: {
    backgroundColor: '#2A3441',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    minWidth: 40,
    textAlign: 'right',
  },
});