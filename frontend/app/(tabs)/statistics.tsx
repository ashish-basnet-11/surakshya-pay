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
  { id: 1, name: "Dribble Premium", amount: -80, type: "Subscription" },
  { id: 2, name: "Snapchat Ads", amount: 150, type: "Income" },
  { id: 3, name: "Skype Premium", amount: -70, type: "Subscription" },
];

const monthlyTransactions = [
  { id: 1, name: "Dribble Premium", amount: -280, type: "Subscription" },
  { id: 2, name: "Snapchat Ads", amount: 220, type: "Income" },
  { id: 3, name: "Skype Premium", amount: -190, type: "Subscription" },
];

const Statistics = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly">(
    "weekly"
  );

  const transactions =
    selectedPeriod === "weekly" ? weeklyTransactions : monthlyTransactions;

  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const chartData = [
    {
      name: "Income",
      amount: income,
      color: "#4CAF50",
      legendFontColor: "#fff",
      legendFontSize: 14,
    },
    {
      name: "Expense",
      amount: expense,
      color: "#F44336",
      legendFontColor: "#fff",
      legendFontSize: 14,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Financial Statistics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedPeriod === "weekly" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedPeriod("weekly")}
          >
            <Text
              style={[
                styles.filterText,
                selectedPeriod === "weekly" && styles.filterTextActive,
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedPeriod === "monthly" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedPeriod("monthly")}
          >
            <Text
              style={[
                styles.filterText,
                selectedPeriod === "monthly" && styles.filterTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartBox}>
          <Text style={styles.sectionTitle}>Spending Overview</Text>
          <PieChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: () => "#000",
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />

          <View style={{ marginTop: 25 }}>
            <Text style={[styles.sectionTitle, { textAlign: "left" }]}>
              Transactions ({selectedPeriod})
            </Text>
            {transactions.map((item) => (
              <View key={item.id} style={styles.transactionItem}>
                <Text style={styles.transactionName}>{item.name}</Text>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: item.amount > 0 ? "#4CAF50" : "#F44336" },
                  ]}
                >
                  {item.amount > 0 ? "+" : "-"}${Math.abs(item.amount).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary Box */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Total Income:</Text>
            <Text style={[styles.value, { color: "#fff" }]}>
              ${income.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Total Expense:</Text>
            <Text style={[styles.value, { color: "#fff" }]}>
              ${expense.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Net Balance:</Text>
            <Text
              style={[
                styles.value,
                {
                  color: income - expense >= 0 ? "#81C784" : "#E57373",
                },
              ]}
            >
              ${(income - expense).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.categoryBox}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {["Income", "Subscription"].map((category) => {
            const categorySum = transactions
              .filter((t) => t.type === category)
              .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            return (
              <View key={category} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryAmount}>
                  ${categorySum.toFixed(2)}
                </Text>
                <View style={styles.categoryBarBackground}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      {
                        width: `${
                          Math.min(
                            ((categorySum / (income + expense)) * 100) || 0,
                            100
                          )
                        }%`,
                        backgroundColor:
                          category === "Income" ? "#4CAF50" : "#F44336",
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight:90,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 30,
    backgroundColor: "#2A3441",
    marginHorizontal: 8,
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
  },
  filterText: {
    color: "#8B9DC3",
    fontWeight: "600",
    fontSize: 16,
  },
  filterTextActive: {
    color: "#fff",
  },
  chartBox: {
    backgroundColor: "#2A3441",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  summaryBox: {
    backgroundColor: "#2A3441",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  label: {
    color: "#ccc",
    fontSize: 16,
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 12,
  },

  transactionsBox: {
    backgroundColor: "#2A3441",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#444",
  },
  transactionName: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    width: 100,
    textAlign: "right",
  },

  categoryBox: {
    backgroundColor: "#2A3441",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  categoryItem: {
    flexDirection:"column",  
    alignItems: "flex-start", 
    marginBottom: 12,
  },
  categoryName: {
    color: "#fff",
    fontSize: 16,
  },
  categoryAmount: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 6,
  },
  categoryBarBackground: {
    height: 12,
    backgroundColor: "#444",
    borderRadius: 6,
    marginHorizontal: 0,
    overflow: "hidden",
    width: "100%",
  },
  categoryBarFill: {
    height: "100%",
    borderRadius: 6,
  },
});
