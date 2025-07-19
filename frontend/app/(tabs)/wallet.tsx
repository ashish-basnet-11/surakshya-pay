import React from "react";
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
    date: "20 Dec 2024 • 10:00 AM",
    amount: -280,
    icon: "🎨",
    color: "#4CAF50",
  },
  {
    id: 2,
    name: "Snapchat Ads",
    date: "10 Dec 2024 • 12:00 PM",
    amount: +220,
    icon: "👻",
    color: "#FFEB3B",
  },
  {
    id: 3,
    name: "Skype Premium",
    date: "08 Dec 2024 • 08:00 AM",
    amount: -190,
    icon: "💬",
    color: "#9C27B0",
  },
];

const chartData = {
  labels: transactions.map((t) => t.name.split(" ")[0]),
  datasets: [
    {
      data: transactions.map((t) => Math.abs(t.amount)),
    },
  ],
};

const WalletScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>All Transactions</Text>
      </View>

      <View style={styles.transactionsContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={[styles.transactionIcon, { backgroundColor: transaction.color + "33" }]}>
                <Text style={[styles.transactionEmoji, { color: transaction.color }]}>{transaction.icon}</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>{transaction.name}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: transaction.amount > 0 ? "#4CAF50" : "#F44336" },
                ]}
              >
                {transaction.amount > 0 ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.chartWrapper}>
        <Text style={styles.chartTitle}>Transaction Summary</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 48}
          height={230}
          yAxisLabel="$"
          fromZero
          withInnerLines={false}
          showBarTops={false}
          chartConfig={{
            backgroundGradientFrom: "#2A3441",
            backgroundGradientTo: "#2A3441",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: () => "#fff",
            fillShadowGradient: "#fff",
            fillShadowGradientOpacity: 1,
            propsForBackgroundLines: {
              stroke: "rgba(255,255,255,0.2)",
            },
          }}
          style={{
            borderRadius: 16,
            marginTop: 8,
            elevation: 0,
            shadowColor: "transparent",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
          }}
          verticalLabelRotation={0}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#ccc",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chartWrapper: {
    marginHorizontal: 16,
    marginBottom: 140,
    padding: 16,
    backgroundColor: "#2A3441",
    borderRadius: 20,
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
});

export default WalletScreen;
