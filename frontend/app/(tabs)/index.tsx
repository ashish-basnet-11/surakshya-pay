import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";

const BankingWalletUI = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const router = useRouter();

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

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

  const actionButtons = [
    { name: "Top Up", icon: "add" },
    { name: "Withdraw", icon: "download-outline" },
    { name: "Exchange", icon: "swap-horizontal" },
    { name: "Details", icon: "document-text-outline" },
    { name: "More", icon: "ellipsis-horizontal" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>EP</Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Hey welcome back</Text>
            <Text style={styles.userName}>Eleanor Pinas</Text>
          </View>
        </View>

        {/* Notification icon with navigation */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/notification")}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balance}>
                {isBalanceVisible ? "$ 80,000.00" : "$ ••••••"}
              </Text>
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={toggleBalanceVisibility}
              >
                <Ionicons
                  name={isBalanceVisible ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="rgba(255, 255, 255, 0.8)"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {actionButtons.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>{action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push("/wallet")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

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
                {transaction.amount > 0 ? "+" : ""}
                ${Math.abs(transaction.amount)}
              </Text>
            </View>
          ))}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 30,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  welcomeText: {
    color: "#8B9DC3",
    fontSize: 14,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  notificationButton: {
    padding: 8,
  },
  balanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    height: 120,
    justifyContent: "center",
  },
  balanceLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "center",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  balance: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginRight: 10,
  },
  eyeButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2A3441",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    color: "#8B9DC3",
    fontSize: 12,
    fontWeight: "500",
  },
  transactionsContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 25,
    minHeight: 400,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a2332",
  },
  viewAllText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: "500",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    color: "#1a2332",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#8B9DC3",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BankingWalletUI;
