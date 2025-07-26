import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const router = useRouter();

const MOCK_DATA = {
  stats: {
    totalUsers: 15847,
    activeTransactions: 342,
    totalVolume: 2847392.5,
    zkProofVerifications: 45621,
    systemUptime: 99.97,
  },
  kycUsers: [
    {
      id: "KYC20230715",
      name: "Rahul Sharma",
      dob: "15/07/1990",
      pan: "ABCDE1234F",
      aadhaar: "XXXX-XXXX-7890",
      status: "pending",
      submitted: "2023-07-15",
      zkVerified: true,
      confidence: 99.98,
    },
    {
      id: "KYC20230714",
      name: "Priya Patel",
      dob: "22/05/1988",
      pan: "FGHIJ5678K",
      aadhaar: "XXXX-XXXX-1234",
      status: "approved",
      submitted: "2023-07-14",
      approved: "2023-07-15",
      zkVerified: true,
      confidence: 99.95,
    },
    {
      id: "KYC20230713",
      name: "Amit Singh",
      dob: "30/11/1992",
      pan: "LMNOP9012Q",
      aadhaar: "XXXX-XXXX-5678",
      status: "pending",
      submitted: "2023-07-13",
      zkVerified: false,
      confidence: 85.23,
    },
    {
      id: "KYC20230712",
      name: "Neha Gupta",
      dob: "18/03/1995",
      pan: "RSTUV3456W",
      aadhaar: "XXXX-XXXX-9012",
      status: "approved",
      submitted: "2023-07-12",
      approved: "2023-07-13",
      zkVerified: true,
      confidence: 99.99,
    },
  ],
};

const KycUserCard = ({ user, status, onApprove, onReject }: any) => (
  <View style={[styles.kycUserCard, status === 'approved' && styles.approvedCard]}>
    <View style={styles.kycUserHeader}>
      <View style={styles.kycUserAvatar}>
        <Ionicons name="person" size={24} color={Colors.textInverse} />
      </View>
      <View style={styles.kycUserInfo}>
        <Text style={styles.kycUserName}>{user.name}</Text>
        <Text style={styles.kycUserId}>#{user.id}</Text>
      </View>
      {status === 'approved' ? (
        <View style={styles.kycApprovedBadge}>
          <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
          <Text style={styles.kycBadgeText}>Approved</Text>
        </View>
      ) : (
        <View style={styles.kycPendingBadge}>
          <Text style={styles.kycBadgeText}>Pending</Text>
        </View>
      )}
    </View>

    <View style={styles.kycUserDetails}>
      <View style={styles.kycDetailRow}>
        <Text style={styles.kycDetailLabel}>Submitted:</Text>
        <Text style={styles.kycDetailValue}>{user.submitted}</Text>
      </View>
      {status === 'approved' && (
        <View style={styles.kycDetailRow}>
          <Text style={styles.kycDetailLabel}>Approved:</Text>
          <Text style={styles.kycDetailValue}>{user.approved}</Text>
        </View>
      )}
      <View style={styles.kycDetailRow}>
        <Text style={styles.kycDetailLabel}>ZK Verification:</Text>
        <View style={styles.zkVerificationStatus}>
          <Ionicons 
            name={user.zkVerified ? "shield-checkmark" : "alert-circle"} 
            size={16} 
            color={user.zkVerified ? Colors.success : Colors.warning} 
          />
          <Text style={[styles.kycDetailValue, { color: user.zkVerified ? Colors.success : Colors.warning }]}>
            {user.zkVerified ? `Verified (${user.confidence}%)` : "Needs Review"}
          </Text>
        </View>
      </View>
    </View>

    {status === 'pending' && (
      <View style={styles.kycActionButtons}>
        <TouchableOpacity 
          style={[styles.kycButton, styles.rejectButton]}
          onPress={onReject}
        >
          <Text style={styles.kycButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.kycButton, styles.approveButton]}
          onPress={onApprove}
        >
          <Text style={styles.kycButtonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style ={styles.eyeIcon}  onPress={() => router.replace("/(admin)/KycDetails")}>
          <Ionicons 
            name="eye-outline"
            size={20}
            color={"#ffffff"}
          />
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const AdminDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedKycTab, setSelectedKycTab] = useState("pending");
  const [stats, setStats] = useState(MOCK_DATA.stats);
  const [kycUsers, setKycUsers] = useState(MOCK_DATA.kycUsers);

  const pendingUsers = kycUsers.filter(user => user.status === 'pending');
  const approvedUsers = kycUsers.filter(user => user.status === 'approved');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      setStats((prev) => ({
        ...prev,
        activeTransactions: Math.floor(Math.random() * 500) + 200,
        zkProofVerifications:
          prev.zkProofVerifications + Math.floor(Math.random() * 10),
      }));
    }, 2000);
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleApproveUser = (userId: string) => {
    Alert.alert("Approve User", "Are you sure you want to approve this KYC application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          setKycUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === userId 
                ? { ...user, status: 'approved', approved: new Date().toISOString().split('T')[0] } 
                : user
            )
          );
          Alert.alert("Approved", "KYC application has been approved");
        },
      },
    ]);
  };

  const handleRejectUser = (userId: string) => {
    Alert.alert("Reject User", "Are you sure you want to reject this KYC application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          setKycUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
          Alert.alert("Rejected", "KYC application has been rejected");
        },
      },
    ]);
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color, `${color}`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 2, y: 2 }}
        style={styles.statGradient}
      >
        <View style={styles.statHeader}>
          <Ionicons name={icon} size={24} color={Colors.textInverse} />
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );

  const TransactionItem = ({ transaction }: any) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionId}>#{transaction.id}</Text>
          <Text style={styles.transactionAmount}>
            ₹{transaction.amount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.transactionStatus}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  transaction.status === "verified"
                    ? Colors.success
                    : transaction.status === "pending"
                    ? Colors.warning
                    : Colors.error,
              },
            ]}
          >
            <Text style={styles.statusText}>{transaction.status}</Text>
          </View>
          {transaction.zkProof && (
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={Colors.success}
            />
          )}
        </View>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionFlow}>
          {transaction.from} → {transaction.to}
        </Text>
        <Text style={styles.transactionTime}>{transaction.timestamp}</Text>
      </View>
    </View>
  );

  const AlertItem = ({ alert }: any) => (
    <View style={styles.alertItem}>
      <View style={styles.alertIcon}>
        <Ionicons
          name={
            alert.type === "error"
              ? "alert-circle"
              : alert.type === "warning"
              ? "warning"
              : "information-circle"
          }
          size={20}
          color={
            alert.type === "error"
              ? Colors.error
              : alert.type === "warning"
              ? Colors.warning
              : Colors.info
          }
        />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertMessage}>{alert.message}</Text>
        <Text style={styles.alertPriority}>Priority: {alert.priority}</Text>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.primary, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[Colors.secondary, Colors.secondaryLight]}
                  style={styles.logoGradient}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={24}
                    color={Colors.textInverse}
                  />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.brandName}>SurakshyaPay Admin</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={Colors.textInverse}
              />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {["overview", "kyc", "users"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {selectedTab === "overview" && (
            <>
              {/* Stats Grid */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Overview</Text>
                <View style={styles.statsGrid}>
                  <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon="people"
                    color={Colors.primary}
                  />
                  <StatCard
                    title="Active Transactions"
                    value={stats.activeTransactions.toString()}
                    icon="swap-horizontal"
                    color={Colors.secondary}
                  />
                  <StatCard
                    title="Total Volume"
                    value={`₹${(stats.totalVolume / 1000000).toFixed(1)}M`}
                    icon="trending-up"
                    color={Colors.success}
                    subtitle="This month"
                  />
                  <StatCard
                    title="ZK Proofs Verified"
                    value={stats.zkProofVerifications.toLocaleString()}
                    icon="shield-checkmark"
                    color={Colors.info}
                    subtitle="Today"
                  />
                </View>
              </View>

              {/* System Health */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Health</Text>
                <View style={styles.healthCard}>
                  <LinearGradient
                    colors={[Colors.success, `${Colors.success}`]}
                    style={styles.healthGradient}
                  >
                    <View style={styles.healthHeader}>
                      <Ionicons
                        name="checkmark-circle"
                        size={32}
                        color={Colors.textInverse}
                      />
                      <Text style={styles.healthStatus}>
                        System Operational
                      </Text>
                    </View>
                    <Text style={styles.healthUptime}>
                      Uptime: {stats.systemUptime}%
                    </Text>
                    <Text style={styles.healthDescription}>
                      All ZK proof verification nodes are running optimally
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </>
          )}

          {selectedTab === "kyc" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>KYC Verification</Text>
              <View style={styles.transactionControls}>
                <TouchableOpacity 
                  style={[styles.controlButton, selectedKycTab === 'pending' && styles.activeControlButton]}
                  onPress={() => setSelectedKycTab('pending')}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={20}
                    color={Colors.textInverse}
                  />
                  <Text style={styles.controlButtonText}>
                    Pending Approvals ({pendingUsers.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.controlButton, selectedKycTab === 'approved' && styles.activeControlButton]}
                  onPress={() => setSelectedKycTab('approved')}
                >
                  <Ionicons
                    name="checkmark-done"
                    size={20}
                    color={Colors.textInverse}
                  />
                  <Text style={styles.controlButtonText}>Approved Users ({approvedUsers.length})</Text>
                </TouchableOpacity>

              </View>

              {selectedKycTab === 'pending' ? (
                <View style={styles.kycListContainer}>
                  {pendingUsers.length > 0 ? (
                    pendingUsers.map(user => (
                      <KycUserCard 
                        key={user.id}
                        user={user}
                        onApprove={() => handleApproveUser(user.id)}
                        onReject={() => handleRejectUser(user.id)}
                        status="pending"
                      />
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
                      <Text style={styles.emptyStateText}>No pending KYC applications</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.kycListContainer}>
                  {approvedUsers.length > 0 ? (
                    approvedUsers.map(user => (
                      <KycUserCard 
                        key={user.id}
                        user={user}
                        status="approved"
                      />
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="alert-circle" size={48} color={Colors.warning} />
                      <Text style={styles.emptyStateText}>No approved users yet</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

{selectedTab === "users" && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>User Management</Text>
    <View style={styles.userStats}>
      <View style={styles.userStatsRow}>
        <TouchableOpacity style={styles.statCardWrapper}>
          <StatCard
            title="Active Users"
            value="14,234"
            icon="people"
            color={Colors.primary}
            subtitle="Total active users"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCardWrapper}>
          <StatCard
            title="New Registrations"
            value="156"
            icon="person-add"
            color={Colors.secondary}
            subtitle="This week"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.userStatsRow}>
        <TouchableOpacity style={styles.statCardWrapper}>
          <StatCard
            title="KYC Verified"
            value="14,234"
            icon="shield-checkmark"
            color={Colors.success}
            subtitle="Total KYC verified"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCardWrapper}>
          <StatCard
            title="KYC Rejected"
            value="1,245"
            icon="close-circle"
            color={Colors.error}
            subtitle="Total KYC rejected"
          />
        </TouchableOpacity>
      </View>
    </View>

 
    {/* Reports Section */}
    <View style={styles.subSection}>
      <Text style={styles.subSectionTitle}>Reports</Text>
      <View style={styles.reportsContainer}>
        <TouchableOpacity style={styles.reportCard}>
          <LinearGradient
            colors={[Colors.info, Colors.infoLight]}
            style={styles.reportGradient}
          >
            <Ionicons name="document-text" size={24} color={Colors.textInverse} />
            <Text style={styles.reportTitle}>Monthly Activity</Text>
            <Text style={styles.reportSubtitle}>Generate user report</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.reportCard}>
          <LinearGradient
            colors={[Colors.success, Colors.successLight]}
            style={styles.reportGradient}
          >
            <Ionicons name="analytics" size={24} color={Colors.textInverse} />
            <Text style={styles.reportTitle}>KYC Analytics</Text>
            <Text style={styles.reportSubtitle}>View verification trends</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.bottomSpace} />
  </View >
)}
        </ScrollView>
      </SafeAreaView >
    </>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    marginRight: 12,
  },
  logoGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textInverse,
    letterSpacing: -0.5,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: Colors.textInverse,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.neutral300,
  },
  activeTabText: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  statGradient: {
    padding: 16,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textInverse,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textInverse,
    opacity: 0.8,
    fontWeight: "600",
  },
  statSubtitle: {
    fontSize: 10,
    color: Colors.textInverse,
    opacity: 0.6,
    marginTop: 2,
  },
  healthCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  healthGradient: {
    padding: 20,
  },
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  healthStatus: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textInverse,
    marginLeft: 12,
  },
  healthUptime: {
    fontSize: 14,
    color: Colors.textInverse,
    fontWeight: "600",
    marginBottom: 4,
  },
  healthDescription: {
    fontSize: 12,
    color: Colors.textInverse,
    opacity: 0.8,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: Colors.backgroundTertiary,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.success,
    marginTop: 2,
  },
  transactionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textInverse,
    textTransform: "uppercase",
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionFlow: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  transactionTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  transactionControls: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeControlButton: {
    backgroundColor: Colors.primary,
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textInverse,
  },
  userStats: {
    flexDirection: "row",
    gap: 12,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundTertiary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  alertPriority: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  kycListContainer: {
    gap: 12,
    marginTop: 8,
  },
  kycUserCard: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  approvedCard: {
    borderColor: Colors.success,
  },
  kycUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  kycUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  kycUserInfo: {
    flex: 1,
  },
  kycUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  kycUserId: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  kycPendingBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  kycApprovedBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kycBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  kycUserDetails: {
    gap: 6,
    marginBottom: 12,
  },
  kycDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kycDetailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  kycDetailValue: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  zkVerificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kycActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  kycButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: Colors.error,
    marginRight: 10,
  },
  approveButton: {
    backgroundColor: Colors.success,
    marginLeft: 10,
  },
  kycButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  eyeIcon: {
    marginLeft:10,
    marginTop:2,
    backgroundColor:Colors.shadowDark,
    borderRadius:12,
    padding:10,
  },
   userStats: {
    gap: 12,
  },
  userStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCardWrapper: {
    flex: 1,
  },
   subSection: {
    marginTop: 24,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  reportsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  reportCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  reportGradient: {
    padding: 16,
    alignItems: 'center',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textInverse,
    marginTop: 8,
    textAlign: 'center',
  },
  reportSubtitle: {
    fontSize: 12,
    color: Colors.textInverse,
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  bottomSpace: {
    marginBottom:80
  }
});