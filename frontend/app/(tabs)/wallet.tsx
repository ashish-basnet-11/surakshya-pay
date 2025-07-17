import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import Colors from "@/constants/Colors";
import { BarChart } from "react-native-chart-kit";

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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Transaction Summary</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 20}
          height={230}
          yAxisLabel="$"
          yAxisSuffix="" 
          chartConfig={{
            backgroundGradientFrom: Colors.primary,
            backgroundGradientTo: Colors.primary,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: Colors.secondary,
            },
          }}
          style={{
            borderRadius: 16,
            marginRight: 20,
          }}
          verticalLabelRotation={0}
          fromZero
        />
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.boxWrapper}>
          <Text style={styles.title}>All Transactions</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: transaction.color },
                  ]}
                >
                  <Text style={styles.transactionEmoji}>{transaction.icon}</Text>
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
                  {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  chartContainer: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  bottomSheet: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 70,
  },
  boxWrapper: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 40,
    minHeight: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
    color: "#000",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#555",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default WalletScreen;
