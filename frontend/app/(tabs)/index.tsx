"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Animated,
  RefreshControl,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "@/store/use-auth-store";
import {
  BadgeCheck,
  BanknoteArrowDown,
  BanknoteArrowUp,
  Send,
} from "lucide-react-native";
import { useCurrentUserDetail } from "@/apis/users/get-user-detail";
import Loader from "@/components/Loader";

const BankingWalletUI = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { data, isLoading } = useCurrentUserDetail({
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (data?.data) {
      useAuthStore.getState().setUser(data?.data);
    }
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(tabs)");
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => backHandler.remove();
    }, [])
  );

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const transactions = [
    {
      id: 1,
      name: "Adobe Creative Suite",
      date: "Today • 2:30 PM",
      amount: -59.99,
      status: "completed",
      icon: "brush-outline",
      color: Colors.error,
      bgColor: Colors.error + "15",
    },
    {
      id: 2,
      name: "Freelance Payment",
      date: "Yesterday • 4:15 PM",
      amount: 2850.0,
      status: "completed",
      icon: "briefcase-outline",
      color: Colors.success,
      bgColor: Colors.success + "15",
    },
    {
      id: 3,
      name: "Microsoft 365",
      date: "Dec 18 • 9:00 AM",
      amount: -12.99,
      status: "completed",
      icon: "laptop-outline",
      color: Colors.warning,
      bgColor: Colors.warning + "15",
    },
    {
      id: 4,
      name: "Investment Return",
      date: "Dec 17 • 11:30 AM",
      amount: 450.75,
      status: "pending",
      icon: "trending-up-outline",
      color: Colors.info,
      bgColor: Colors.info + "15",
    },
  ];

  const actionButtons = [
    {
      name: "Send Money",
      icon: <Send size={22} color={Colors.textInverse} />,
      gradient: [Colors.neutral900, Colors.neutral600],
      route: "/sendMoney",
      description: "Transfer money to others",
    },
    {
      name: "Add Money",
      icon: <BanknoteArrowUp size={22} color={Colors.textInverse} />,
      gradient: [Colors.success, Colors.accentLight],
      route: "/(tabs)/(index)/topup",
      description: "Top up wallet",
    },
    {
      name: "Withdraw",
      icon: <BanknoteArrowDown size={22} color={Colors.textInverse} />,
      gradient: [Colors.secondary, Colors.secondaryLight],
      route: "/(tabs)/(index)/withdraw",
      description: "Transfer funds",
    },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 0],
    extrapolate: "clamp",
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryLight}
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() =>
                  router.push("/(tabs)/(settings)/profile-details")
                }
              >
                <LinearGradient
                  colors={[Colors.secondary, Colors.secondaryLight]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>EP</Text>
                </LinearGradient>
                <View style={styles.onlineIndicator} />
              </TouchableOpacity>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Good afternoon</Text>
                <Text style={styles.userName}>
                  {useAuthStore.getState().user?.full_name}
                </Text>
                <View style={styles.premiumBadge}>
                  <BadgeCheck size={12} color={Colors.success} />
                  <Text style={styles.premiumText}>Verified</Text>
                </View>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push("/scan")}
              >
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.1)",
                    "rgba(255, 255, 255, 0.2)",
                  ]}
                  style={styles.headerButtonGradient}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={20}
                    color={Colors.textInverse}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push("/notification")}
              >
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.1)",
                    "rgba(255, 255, 255, 0.2)",
                  ]}
                  style={styles.headerButtonGradient}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={Colors.textInverse}
                  />
                  <View style={styles.notificationBadge} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.textInverse}
            colors={[Colors.secondary]}
            progressBackgroundColor={Colors.primary}
          />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight, Colors.primaryDark]}
              style={styles.balanceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Decorative Elements */}
              <View style={styles.decorativeCircle1} />
              <View style={styles.decorativeCircle2} />

              <View style={styles.balanceHeader}>
                <View>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <View style={styles.balanceLabelUnderline} />
                </View>
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={toggleBalanceVisibility}
                >
                  <BlurView
                    intensity={20}
                    tint="light"
                    style={styles.eyeButtonBlur}
                  >
                    <Ionicons
                      name={
                        isBalanceVisible ? "eye-outline" : "eye-off-outline"
                      }
                      size={18}
                      color={Colors.textInverse}
                    />
                  </BlurView>
                </TouchableOpacity>
              </View>

              <View style={styles.balanceContent}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 2
                  }}
                >
                  {isBalanceVisible ? (
                    <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 2
                  }}
                >
                      <Text style={styles.balanceCurrency}>
                        NPR
                        {/* {isBalanceVisible ? "NPR 124,580.50" : "$•••,•••.••"} */}
                      </Text>
                      <Text style={styles.balance}>
                        {` ${parseFloat(
                          useAuthStore.getState().user?.balance || "0"
                        ).toFixed(2)}`}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.balance}>XXX.XX</Text>
                  )}
                </View>
                <View style={styles.balanceChange}>
                  <Text style={styles.balanceChangeText}>
                    Your Transactions, Zero Exposure
                  </Text>
                </View>
              </View>

              {/* Enhanced Quick Stats */}
              {/* <View style={styles.quickStatsContainer}>
                {quickStats.map((stat, index) => (
                  <View key={index} style={styles.quickStat}>
                    <View style={styles.quickStatHeader}>
                      <Ionicons name={stat.icon} size={14} color={Colors.neutral300} />
                      <Text style={styles.quickStatLabel}>{stat.label}</Text>
                    </View>
                    <Text style={styles.quickStatValue}>{stat.value}</Text>
                    <View style={styles.quickStatChange}>
                      <Ionicons
                        name={stat.positive ? "trending-up" : "trending-down"}
                        size={10}
                        color={stat.positive ? Colors.success : Colors.error}
                      />
                      <Text
                        style={[styles.quickStatChangeText, { color: stat.positive ? Colors.success : Colors.error }]}
                      >
                        {stat.change}
                      </Text>
                    </View>
                  </View>
                ))}
              </View> */}
            </LinearGradient>
          </View>
        </View>

        {/* Enhanced Action Buttons */}
        <View style={styles.actionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            {/* <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreButtonText}>More</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.secondary} />
            </TouchableOpacity> */}
          </View>

          <View style={styles.actionsContainer}>
            {actionButtons.map((action, index) => {
              const handlePress = () => {
                router.push(action.route);
              };

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.actionButton}
                  onPress={handlePress}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonCard}>
                    <LinearGradient
                      colors={action.gradient}
                      style={styles.actionButtonGradient}
                    >
                      <View style={styles.actionIconContainer}>
                        {/* <Ionicons
                          name={action.icon}
                          size={22}
                          color={Colors.textInverse}
                        /> */}
                        {action.icon}
                      </View>
                    </LinearGradient>

                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionText}>{action.name}</Text>
                      <Text style={styles.actionDescription}>
                        {action.description}
                      </Text>
                    </View>

                    <View style={styles.actionArrow}>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={Colors.textSecondary}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Enhanced Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/wallet")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsContainer}>
            {transactions.map((transaction, index) => (
              <TouchableOpacity
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  index === transactions.length - 1 &&
                    styles.lastTransactionItem,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionIconContainer}>
                    <View
                      style={[
                        styles.transactionIconBg,
                        { backgroundColor: transaction.bgColor },
                      ]}
                    >
                      <Ionicons
                        name={transaction.icon}
                        size={20}
                        color={transaction.color}
                      />
                    </View>
                    <View
                      style={[
                        styles.transactionStatusIndicator,
                        {
                          backgroundColor:
                            transaction.status === "completed"
                              ? Colors.success
                              : Colors.warning,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionName}>
                      {transaction.name}
                    </Text>
                    <View style={styles.transactionMeta}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.transactionCategory}>
                          {transaction.category}
                        </Text>
                      </View>
                      <View style={styles.transactionDot} />
                      <Text style={styles.transactionDate}>
                        {transaction.date}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.amount > 0
                            ? Colors.success
                            : Colors.textPrimary,
                      },
                    ]}
                  >
                    {transaction.amount > 0 ? "+" : ""}$
                    {Math.abs(transaction.amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                  <View
                    style={[
                      styles.transactionStatusBadge,
                      {
                        backgroundColor:
                          transaction.status === "completed"
                            ? Colors.success + "20"
                            : Colors.warning + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.transactionStatusText,
                        {
                          color:
                            transaction.status === "completed"
                              ? Colors.success
                              : Colors.warning,
                        },
                      ]}
                    >
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* New Insights Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Financial Insights</Text>
          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <LinearGradient
                colors={[Colors.info + "20", Colors.info + "10"]}
                style={styles.insightGradient}
              >
                <View style={styles.insightIcon}>
                  <Ionicons name="bulb-outline" size={20} color={Colors.info} />
                </View>
                <Text style={styles.insightTitle}>Smart Saving Tip</Text>
                <Text style={styles.insightText}>
                  You're spending 15% less on subscriptions this month. Great
                  job!
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  headerContainer: {
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 20 : 40,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    color: Colors.neutral300,
    fontSize: 14,
    fontWeight: "500",
  },
  userName: {
    color: Colors.textInverse,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginTop: 2,
    marginBottom: 4,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  premiumText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  headerButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  balanceSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  balanceCard: {
    borderRadius: 24,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceGradient: {
    borderRadius: 24,
    padding: 28,
    position: "relative",
    overflow: "hidden",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  balanceLabel: {
    color: Colors.neutral300,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  balanceLabelUnderline: {
    width: 30,
    height: 2,
    backgroundColor: Colors.accent,
    marginTop: 4,
    borderRadius: 1,
  },
  eyeButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  eyeButtonBlur: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  balanceContent: {
    // marginBottom: 28,
  },
  balanceCurrency: {
    color: Colors.textInverse,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  balance: {
    color: Colors.textInverse,
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  balanceChange: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  balanceChangeText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 12,
  },
  changeIndicator: {
    backgroundColor: Colors.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeAmount: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: "700",
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  quickStat: {
    flex: 1,
  },
  quickStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  quickStatLabel: {
    color: Colors.neutral300,
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 6,
  },
  quickStatValue: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  quickStatChange: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickStatChangeText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    marginRight: 4,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
  },
  actionButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextContainer: {
    flex: 1,
  },
  actionText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  viewAllText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  transactionsContainer: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  lastTransactionItem: {
    borderBottomWidth: 0,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIconContainer: {
    position: "relative",
    marginRight: 16,
  },
  transactionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionStatusIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.neutral400,
    marginHorizontal: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  transactionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  insightsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  insightsContainer: {
    marginTop: 16,
  },
  insightCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  insightGradient: {
    padding: 20,
    borderRadius: 16,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.info + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default BankingWalletUI;
