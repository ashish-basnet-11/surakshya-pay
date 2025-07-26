import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { useFocusEffect } from "@react-navigation/native";
import { useNotificationsList } from "@/apis/notifications/get-notifications";
import Loader from "@/components/Loader";
import { Notification as NotificationInterface } from "@/types/notifications";
import { formatDateTime } from "@/utils/helpers";

const Notification = () => {
  const router = useRouter();
  const {
    data: notificationList,
    isLoading: refreshing,
    refetch,
  } = useNotificationsList();

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

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const getNotificationIcon = (type: string, subtype: string) => {
    switch (type) {
      case "transaction":
        return subtype === "received" ? "arrow-down-circle" : "arrow-up-circle";
      case "system":
        return subtype === "credit" ? "card" : "information-circle";
      case "security":
        return "shield-checkmark";
      default:
        return "notifications";
    }
  };

  if (refreshing) {
    return <Loader />;
  }

  const getNotificationColor = (type: string, subtype: string) => {
    switch (type) {
      case "transaction":
        return subtype === "received" ? "#4CAF50" : "#FF5722";
      case "system":
        return "#2196F3";
      case "security":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationInterface;
    index: number;
  }) => {
    const iconName = getNotificationIcon(
      item?.notification_type,
      item?.message.includes("received") ? "received" : "withdraw"
    );
    const iconColor = getNotificationColor(
      item?.notification_type,
      item?.message.includes("received") ? "received" : "withdraw"
    );
    const isLast = index === Number(notificationList.data?.length ?? 1) - 1;

    return (
      <TouchableOpacity
        style={[styles.card, isLast && styles.cardLast]}
        // onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {/* Avatar and Icon */}
          {/* <View style={styles.avatarContainer}>
            <View style={[styles.avatar, !item.is_read && styles.avatarUnread]}>
              <Text style={styles.avatarText}>{item.avatar}</Text>
            </View>
            <View
              style={[styles.notificationIcon, { backgroundColor: iconColor }]}
            >
              <Ionicons name={iconName} size={12} color="#ffffff" />
            </View>
          </View> */}

          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <Text
                style={[styles.title, !item.is_read && styles.titleUnread]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View style={styles.metaContainer}>
                {!item.is_read && <View style={styles.unreadDot} />}
                <Text style={styles.time}>{formatDateTime(item.created_at)}</Text>
              </View>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.detail}>{item.message}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Notifications</Text>
            <Text style={styles.headerSubtext}>
              {notificationList?.data?.length || 0 > 0
                ? `${notificationList?.data?.filter((i) => !i.is_read).length} unread notifications`
                : "All caught up!"}
            </Text>
          </View>
          {/* <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <Ionicons name="funnel-outline" size={24} color="#ffffff" />
          </TouchableOpacity> */}
        </View>

        {/* Mark All Button */}
        {0 > 0 && (
          <View style={styles.markAllContainer}>
            <TouchableOpacity
              style={styles.markAllButton}
              // onPress={markAllAsRead}
            >
              <Ionicons name="checkmark-done" size={16} color="#ffffff" />
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notification List */}
        <View style={styles.listContainer}>
          <View style={styles.notificationCard}>
            <FlatList
              data={notificationList?.data}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#ffffff"
                  colors={[Colors.primary]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={48}
                    color="#8E8E93"
                  />
                  <Text style={styles.emptyTitle}>No Notifications</Text>
                  <Text style={styles.emptyDescription}>
                    You&apos;re all caught up! New notifications will appear
                    here.
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
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
    padding: 8,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    marginLeft: 50,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  headerSubtext: {
    fontSize: 14,
    color: "#B3C5D7",
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerSection: {
    marginBottom: 20,
  },
  markAllContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  markAllText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20
  },
  notificationCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  cardLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarUnread: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  notificationIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    flex: 1,
    marginRight: 8,
  },
  titleUnread: {
    fontWeight: "700",
    color: "#000000",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5722",
    marginRight: 6,
  },
  time: {
    fontSize: 12,
    color: "#8E8E93",
  },
  message: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  detail: {
    fontSize: 12,
    color: "#8E8E93",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  securityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF9800",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
