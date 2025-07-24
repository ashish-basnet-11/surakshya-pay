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
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const router = useRouter();

// Mock data for dashboard
const MOCK_DATA = {
  stats: {
    totalUsers: 15847,
    activeTransactions: 342,
    totalVolume: 2847392.50,
    zkProofVerifications: 45621,
    systemUptime: 99.97,
  },
  recentTransactions: [
    { id: 'tx001', from: 'user***123', to: 'user***456', amount: 1250.00, status: 'verified', zkProof: true, timestamp: '2 mins ago' },
    { id: 'tx002', from: 'user***789', to: 'user***012', amount: 850.50, status: 'pending', zkProof: true, timestamp: '5 mins ago' },
    { id: 'tx003', from: 'user***345', to: 'user***678', amount: 2100.00, status: 'verified', zkProof: true, timestamp: '8 mins ago' },
    { id: 'tx004', from: 'user***901', to: 'user***234', amount: 675.25, status: 'failed', zkProof: false, timestamp: '12 mins ago' },
  ],
  systemAlerts: [
    { id: 'alert001', type: 'warning', message: 'High transaction volume detected', priority: 'medium' },
    { id: 'alert002', type: 'info', message: 'ZK proof verification system updated', priority: 'low' },
    { id: 'alert003', type: 'error', message: '2 failed proof verifications', priority: 'high' },
  ],
};

const AdminDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [stats, setStats] = useState(MOCK_DATA.stats);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      setStats(prev => ({
        ...prev,
        activeTransactions: Math.floor(Math.random() * 500) + 200,
        zkProofVerifications: prev.zkProofVerifications + Math.floor(Math.random() * 10),
      }));
    }, 2000);
  }, []);

 const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
           router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color, `${color}20`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
          <Text style={styles.transactionAmount}>₹{transaction.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.transactionStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: transaction.status === 'verified' ? Colors.success : 
                                transaction.status === 'pending' ? Colors.warning : Colors.error }
          ]}>
            <Text style={styles.statusText}>{transaction.status}</Text>
          </View>
          {transaction.zkProof && (
            <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
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
          name={alert.type === 'error' ? 'alert-circle' : alert.type === 'warning' ? 'warning' : 'information-circle'} 
          size={20} 
          color={alert.type === 'error' ? Colors.error : alert.type === 'warning' ? Colors.warning : Colors.info} 
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
          colors={[Colors.primary, Colors.primaryLight]}
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
                  <Ionicons name="shield-checkmark" size={24} color={Colors.textInverse} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.brandName}>SurakshyaPay Admin</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {['overview', 'transactions', 'users', 'system'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {selectedTab === 'overview' && (
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
                    colors={[Colors.success, `${Colors.success}20`]}
                    style={styles.healthGradient}
                  >
                    <View style={styles.healthHeader}>
                      <Ionicons name="checkmark-circle" size={32} color={Colors.textInverse} />
                      <Text style={styles.healthStatus}>System Operational</Text>
                    </View>
                    <Text style={styles.healthUptime}>Uptime: {stats.systemUptime}%</Text>
                    <Text style={styles.healthDescription}>
                      All ZK proof verification nodes are running optimally
                    </Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Recent Transactions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <View style={styles.transactionsList}>
                  {MOCK_DATA.recentTransactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </View>
              </View>
            </>
          )}

          {selectedTab === 'transactions' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Management</Text>
              <View style={styles.transactionControls}>
                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="search" size={20} color={Colors.textInverse} />
                  <Text style={styles.controlButtonText}>Search Transactions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="filter" size={20} color={Colors.textInverse} />
                  <Text style={styles.controlButtonText}>Filter by ZK Proof</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.transactionsList}>
                {MOCK_DATA.recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </View>
            </View>
          )}

          {selectedTab === 'users' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>User Management</Text>
              <View style={styles.userStats}>
                <StatCard
                  title="Active Users"
                  value="14,234"
                  icon="people"
                  color={Colors.primary}
                />
                <StatCard
                  title="New Registrations"
                  value="156"
                  icon="person-add"
                  color={Colors.secondary}
                  subtitle="This week"
                />
              </View>
            </View>
          )}

          {selectedTab === 'system' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Alerts</Text>
              <View style={styles.alertsList}>
                {MOCK_DATA.systemAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ZK Proof Configuration</Text>
                <View style={styles.zkConfigCard}>
                  <Text style={styles.zkConfigTitle}>Zero Knowledge Proof Settings</Text>
                  <View style={styles.zkConfigItem}>
                    <Text style={styles.zkConfigLabel}>Verification Timeout</Text>
                    <Text style={styles.zkConfigValue}>30 seconds</Text>
                  </View>
                  <View style={styles.zkConfigItem}>
                    <Text style={styles.zkConfigLabel}>Proof Complexity</Text>
                    <Text style={styles.zkConfigValue}>High Security</Text>
                  </View>
                  <View style={styles.zkConfigItem}>
                    <Text style={styles.zkConfigLabel}>Active Validators</Text>
                    <Text style={styles.zkConfigValue}>12 nodes</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  logoGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textInverse,
    letterSpacing: -0.5,
  },
 
  logoutButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: Colors.textInverse,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textInverse,
    opacity: 0.8,
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 10,
    color: Colors.textInverse,
    opacity: 0.6,
    marginTop: 2,
  },
  healthCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  healthGradient: {
    padding: 20,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthStatus: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textInverse,
    marginLeft: 12,
  },
  healthUptime: {
    fontSize: 14,
    color: Colors.textInverse,
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success,
    marginTop: 2,
  },
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textInverse,
    textTransform: 'uppercase',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionFlow: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  transactionTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  transactionControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
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
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  alertPriority: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  zkConfigCard: {
    backgroundColor: Colors.backgroundTertiary,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  zkConfigTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  zkConfigItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  zkConfigLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  zkConfigValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});