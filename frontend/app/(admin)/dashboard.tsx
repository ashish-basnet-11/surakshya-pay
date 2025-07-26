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
import { 
  getAdminDashboardStats, 
  getAllKYCSubmissions, 
  updateKYCStatus,
  getAllUsers,
  getUserStats,
  updateUserStatus,
  AdminDashboardStats,
  KYCSubmission,
  User,
  UserStats
} from "@/apis/admin/admin-api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

const KycUserCard = ({ user, status, onApprove, onReject, router }: any) => (
  <View style={[styles.kycUserCard, status === 'approved' && styles.approvedCard]}>
    <View style={styles.kycUserHeader}>
      <View style={styles.kycUserAvatar}>
        <Ionicons name="person" size={24} color={Colors.textInverse} />
      </View>
      <View style={styles.kycUserInfo}>
        <Text style={styles.kycUserName}>{user.full_name}</Text>
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
        <Text style={styles.kycDetailLabel}>Document:</Text>
        <Text style={styles.kycDetailValue}>{user.document_type}</Text>
      </View>
      <View style={styles.kycDetailRow}>
        <Text style={styles.kycDetailLabel}>Document Number:</Text>
        <Text style={styles.kycDetailValue}>{user.document_number}</Text>
      </View>
      <View style={styles.kycDetailRow}>
        <Text style={styles.kycDetailLabel}>Date of Birth:</Text>
        <Text style={styles.kycDetailValue}>{user.date_of_birth}</Text>
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
        <TouchableOpacity style ={styles.eyeIcon}  onPress={() => {
          console.log(user)
          router.push({
            pathname: "/(admin)/KycDetails",
            params: {
              id: user.user_id
            }
          })
        }}>
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
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedKycTab, setSelectedKycTab] = useState("pending");
  const [stats, setStats] = useState<AdminDashboardStats>({
    total_users: 0,
    total_admins: 0,
    total_kyc_submitted: 0,
    total_kyc_approved: 0,
    total_kyc_pending: 0,
    total_kyc_rejected: 0,
    total_transactions: 0,
    total_deposit_amount: 0,
    total_withdrawal_amount: 0,
    total_transfer_amount: 0,
  });
  const [kycUsers, setKycUsers] = useState<KYCSubmission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total_users: 0,
    active_users: 0,
    new_users_this_week: 0,
    kyc_verified_users: 0,
  });
  const [loading, setLoading] = useState(true);

  const pendingUsers = kycUsers.filter(user => user.status === 'pending');
  const approvedUsers = kycUsers.filter(user => user.status === 'approved');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, kycResponse, usersResponse, userStatsResponse] = await Promise.all([
        getAdminDashboardStats(),
        getAllKYCSubmissions(),
        getAllUsers(),
        getUserStats()
      ]);
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      if (kycResponse.success) {
        setKycUsers(kycResponse.data);
      }

      if (usersResponse.success) {
        setUsers(usersResponse.data);
      }

      if (userStatsResponse.success) {
        setUserStats(userStatsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchDashboardData();
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

  const handleApproveUser = async (userId: number) => {
    Alert.alert("Approve User", "Are you sure you want to approve this KYC application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          try {
            const response = await updateKYCStatus(userId, { status: 'approved' });
            if (response.success) {
              Alert.alert("Approved", "KYC application has been approved");
              fetchDashboardData(); // Refresh data
            } else {
              Alert.alert("Error", "Failed to approve KYC application");
            }
          } catch (error) {
            console.error('Error approving KYC:', error);
            Alert.alert("Error", "Failed to approve KYC application");
          }
        },
      },
    ]);
  };

  const handleRejectUser = async (userId: number) => {
    Alert.alert("Reject User", "Are you sure you want to reject this KYC application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await updateKYCStatus(userId, { 
              status: 'rejected',
              rejection_reason: 'Application rejected by admin'
            });
            if (response.success) {
              Alert.alert("Rejected", "KYC application has been rejected");
              fetchDashboardData(); // Refresh data
            } else {
              Alert.alert("Error", "Failed to reject KYC application");
            }
          } catch (error) {
            console.error('Error rejecting KYC:', error);
            Alert.alert("Error", "Failed to reject KYC application");
          }
        },
      },
    ]);
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    Alert.alert(`${action.charAt(0).toUpperCase() + action.slice(1)} User`, 
      `Are you sure you want to ${action} this user?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: action.charAt(0).toUpperCase() + action.slice(1),
        style: currentStatus ? "destructive" : "default",
        onPress: async () => {
          try {
            const response = await updateUserStatus(userId, !currentStatus);
            if (response.success) {
              Alert.alert("Success", `User ${action}d successfully`);
              fetchDashboardData(); // Refresh data
            } else {
              Alert.alert("Error", `Failed to ${action} user`);
            }
          } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            Alert.alert("Error", `Failed to ${action} user`);
          }
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

  const UserCard = ({ user, onToggleStatus }: any) => (
    <View style={[styles.userCard, !user.is_active && styles.inactiveUserCard]}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={24} color={Colors.textInverse} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.full_name || user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <View style={styles.userStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: user.is_active ? Colors.success : Colors.error }
          ]}>
            <Text style={styles.statusText}>
              {user.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
          {user.is_superuser && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield" size={12} color={Colors.textInverse} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.userDetailRow}>
          <Text style={styles.userDetailLabel}>Username:</Text>
          <Text style={styles.userDetailValue}>@{user.username}</Text>
        </View>
        {user.phone_number && (
          <View style={styles.userDetailRow}>
            <Text style={styles.userDetailLabel}>Phone:</Text>
            <Text style={styles.userDetailValue}>{user.phone_number}</Text>
          </View>
        )}
        <View style={styles.userDetailRow}>
          <Text style={styles.userDetailLabel}>KYC Status:</Text>
          <Text style={[
            styles.userDetailValue,
            { color: user.kyc_status === 'approved' ? Colors.success : 
                     user.kyc_status === 'pending' ? Colors.warning : Colors.error }
          ]}>
            {user.kyc_status ? user.kyc_status.toUpperCase() : 'NOT SUBMITTED'}
          </Text>
        </View>
        {user.balance && (
          <View style={styles.userDetailRow}>
            <Text style={styles.userDetailLabel}>Balance:</Text>
            <Text style={styles.userDetailValue}>₹{parseFloat(user.balance).toFixed(2)}</Text>
          </View>
        )}
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity 
          style={[
            styles.userActionButton,
            { backgroundColor: user.is_active ? Colors.error : Colors.success }
          ]}
          onPress={() => onToggleStatus(user.id, user.is_active)}
        >
          <Ionicons 
            name={user.is_active ? "pause-circle" : "play-circle"} 
            size={16} 
            color={Colors.textInverse} 
          />
          <Text style={styles.userActionButtonText}>
            {user.is_active ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
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
                    value={stats.total_users.toLocaleString()}
                    icon="people"
                    color={Colors.primary}
                  />
                  <StatCard
                    title="Total Transactions"
                    value={stats.total_transactions.toString()}
                    icon="swap-horizontal"
                    color={Colors.secondary}
                  />
                  <StatCard
                    title="Total Volume"
                    value={`NPR ${((stats.total_deposit_amount + stats.total_withdrawal_amount + stats.total_transfer_amount) / 1000000).toFixed(1)}M`}
                    icon="trending-up"
                    color={Colors.success}
                    subtitle="All time"
                  />
                  <StatCard
                    title="KYC Pending"
                    value={stats.total_kyc_pending.toString()}
                    icon="shield-checkmark"
                    color={Colors.info}
                    subtitle="Awaiting approval"
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
                      KYC Approved: {stats.total_kyc_approved}
                    </Text>
                    <Text style={styles.healthDescription}>
                      All KYC verification processes are running optimally
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
                        onApprove={() => handleApproveUser(user.user_id)}
                        onReject={() => handleRejectUser(user.user_id)}
                        status="pending"
                        router={router}
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
                        router={router}
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
    
    {/* User Statistics */}
    <View style={styles.userStats}>
      <View style={styles.userStatsRow}>
        <TouchableOpacity style={styles.statCardWrapper}>
          <StatCard
            title="Total Users"
            value={userStats.total_users.toLocaleString()}
            icon="people"
            color={Colors.primary}
            subtitle="All registered users"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCardWrapper}>
          <StatCard
            title="Active Users"
            value={userStats.active_users.toLocaleString()}
            icon="person-check"
            color={Colors.success}
            subtitle="Currently active"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.userStatsRow}>
        <TouchableOpacity style={styles.statCardWrapper}>
          <StatCard
            title="New This Week"
            value={userStats.new_users_this_week.toString()}
            icon="person-add"
            color={Colors.secondary}
            subtitle="Recent registrations"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCardWrapper}>
          <StatCard
            title="KYC Verified"
            value={userStats.kyc_verified_users.toLocaleString()}
            icon="shield-checkmark"
            color={Colors.info}
            subtitle="Verified users"
          />
        </TouchableOpacity>
      </View>
    </View>

    {/* User List */}
    <View style={styles.subSection}>
      <Text style={styles.subSectionTitle}>All Users ({users.length})</Text>
      <View style={styles.usersList}>
        {users.length > 0 ? (
          users.map(user => (
            <UserCard 
              key={user.id}
              user={user}
              onToggleStatus={handleToggleUserStatus}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>No users found</Text>
          </View>
        )}
      </View>
    </View>

    {/* Reports Section */}
    <View style={styles.subSection}>
      <Text style={styles.subSectionTitle}>Reports & Analytics</Text>
      <View style={styles.reportsContainer}>
        <TouchableOpacity style={styles.reportCard}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.reportGradient}
          >
            <View style={styles.reportIconContainer}>
              <Ionicons name="document-text" size={28} color={Colors.textInverse} />
            </View>
            <View style={styles.reportContent}>
              <Text style={styles.reportTitle}>Monthly Activity</Text>
              <Text style={styles.reportSubtitle}>Generate comprehensive user report</Text>
              <View style={styles.reportStats}>
                <View style={styles.reportStat}>
                  <Text style={styles.reportStatValue}>{userStats.total_users}</Text>
                  <Text style={styles.reportStatLabel}>Total Users</Text>
                </View>
                <View style={styles.reportStat}>
                  <Text style={styles.reportStatValue}>{userStats.active_users}</Text>
                  <Text style={styles.reportStatLabel}>Active</Text>
                </View>
              </View>
            </View>
            <View style={styles.reportArrow}>
              <Ionicons name="arrow-forward" size={20} color={Colors.textInverse} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.reportCard}>
          <LinearGradient
            colors={[Colors.secondary, Colors.secondaryDark]}
            style={styles.reportGradient}
          >
            <View style={styles.reportIconContainer}>
              <Ionicons name="analytics" size={28} color={Colors.textInverse} />
            </View>
            <View style={styles.reportContent}>
              <Text style={styles.reportTitle}>KYC Analytics</Text>
              <Text style={styles.reportSubtitle}>View verification trends & insights</Text>
              <View style={styles.reportStats}>
                <View style={styles.reportStat}>
                  <Text style={styles.reportStatValue}>{stats.total_kyc_approved}</Text>
                  <Text style={styles.reportStatLabel}>Approved</Text>
                </View>
                <View style={styles.reportStat}>
                  <Text style={styles.reportStatValue}>{stats.total_kyc_pending}</Text>
                  <Text style={styles.reportStatLabel}>Pending</Text>
                </View>
              </View>
            </View>
            <View style={styles.reportArrow}>
              <Ionicons name="arrow-forward" size={20} color={Colors.textInverse} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportCard}>
          <LinearGradient
            colors={[Colors.success, Colors.accentDark]}
            style={styles.reportGradient}
          >
            <View style={styles.reportIconContainer}>
              <Ionicons name="trending-up" size={28} color={Colors.textInverse} />
            </View>
            <View style={styles.reportContent}>
              <Text style={styles.reportTitle}>Transaction Insights</Text>
              <Text style={styles.reportSubtitle}>Financial performance overview</Text>
              <View style={styles.reportStats}>
                <View style={styles.reportStat}>
                  <Text style={styles.reportStatValue}>NPR {((stats.total_deposit_amount + stats.total_withdrawal_amount + stats.total_transfer_amount) / 1000000).toFixed(1)}M</Text>
                  <Text style={styles.reportStatLabel}>Total Volume</Text>
                </View>
                <View style={styles.reportStat}>
                  <Text style={styles.reportStatValue}>{stats.total_transactions}</Text>
                  <Text style={styles.reportStatLabel}>Transactions</Text>
                </View>
              </View>
            </View>
            <View style={styles.reportArrow}>
              <Ionicons name="arrow-forward" size={20} color={Colors.textInverse} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportCard}>
          <LinearGradient
            colors={[Colors.warning, Colors.warning]}
            style={styles.reportGradient}
          >
            <View style={styles.reportIconContainer}>
              <Ionicons name="shield-checkmark" size={28} color={Colors.textInverse} />
            </View>
            <View style={styles.reportContent}>
              <Text style={styles.reportTitle}>Security Report</Text>
              <Text style={styles.reportSubtitle}>System security & compliance</Text>
              <View style={styles.reportStats}>
                <View style={styles.reportStat}>
                  <Text style={styles.reportStatValue}>{userStats.kyc_verified_users}</Text>
                  <Text style={styles.reportStatLabel}>Verified</Text>
                </View>
                <View style={styles.reportStat}>
                  <Text style={styles.reportStatValue}>99.9%</Text>
                  <Text style={styles.reportStatLabel}>Uptime</Text>
                </View>
              </View>
            </View>
            <View style={styles.reportArrow}>
              <Ionicons name="arrow-forward" size={20} color={Colors.textInverse} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.bottomSpace} />
  </View>
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
    paddingTop: 20,
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
    flexWrap: 'wrap',
    gap: 12,
  },
  reportCard: {
    width: (SCREEN_WIDTH - 42),
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  reportGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  reportStat: {
    alignItems: 'center',
  },
  reportStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  reportStatLabel: {
    fontSize: 10,
    color: Colors.textInverse,
    opacity: 0.8,
    marginTop: 2,
  },
  reportArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  // User Management Styles
  usersList: {
    gap: 12,
    marginTop: 8,
  },
  userCard: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inactiveUserCard: {
    opacity: 0.6,
    borderColor: Colors.error,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  adminBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  userDetails: {
    gap: 6,
    marginBottom: 12,
  },
  userDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userDetailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  userDetailValue: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  userActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textInverse,
  },
});