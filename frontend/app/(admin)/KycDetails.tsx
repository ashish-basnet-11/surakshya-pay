import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  Alert,
  BackHandler
} from 'react-native';
import React, { useCallback, useState, useEffect } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { getKYCByUserId, updateKYCStatus, KYCSubmission } from '@/apis/admin/admin-api';
import Loader from '@/components/Loader';

const KycDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<KYCSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchKYCDetails = useCallback(async () => {
    try {
      setLoading(true);
      const userId = typeof id === 'string' ? parseInt(id) : parseInt(id as any);
      const response = await getKYCByUserId(userId);
      if (response.success) {
        setUserDetails(response.data);
      } else {
        Alert.alert('Error', 'Failed to load KYC details');
      }
    } catch (error) {
      console.error('Error fetching KYC details:', error);
      Alert.alert('Error', 'Failed to load KYC details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchKYCDetails();
    }
  }, [fetchKYCDetails, id]);

  const getStatusColor = () => {
    return userDetails?.status === 'approved' ? Colors.success : Colors.warning;
  };

  const getRiskLevel = () => {
    // For now, we'll use a simple risk assessment based on status
    if (userDetails?.status === 'approved') return 'Low Risk';
    if (userDetails?.status === 'pending') return 'Medium Risk';
    return 'High Risk';
  };

  const getRiskColor = () => {
    if (userDetails?.status === 'approved') return Colors.success;
    if (userDetails?.status === 'pending') return Colors.warning;
    return Colors.error;
  };

  const handleBackPress = () => {
    router.push("/(admin)/dashboard");
  };

  const handleApprove = async () => {
    Alert.alert("Approve KYC", "Are you sure you want to approve this KYC application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          try {
            const response = await updateKYCStatus(userDetails.user_id, { status: 'approved' });
            if (response.success) {
              Alert.alert("Approved", "KYC application has been approved");
              fetchKYCDetails(); // Refresh data
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

  const handleReject = async () => {
    Alert.alert("Reject KYC", "Are you sure you want to reject this KYC application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await updateKYCStatus(userDetails.user_id, { 
              status: 'rejected',
              rejection_reason: 'Application rejected by admin'
            });
            if (response.success) {
              Alert.alert("Rejected", "KYC application has been rejected");
              fetchKYCDetails(); // Refresh data
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

    useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/(admin)/dashboard'); 
        return true;
      };
  
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
  
      return () => backHandler.remove();
    }, [])
  );

  if (loading) {
    return (
      <Loader/>
    );
  }

  if (!userDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>KYC details not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>KYC Details</Text>
          <Text style={styles.headerSubtext}>
            {userDetails.status === 'pending' ? 'Pending approval' : 'Approved'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {userDetails.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={Colors.textInverse} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userDetails.full_name}</Text>
              <Text style={styles.userId}>#{userDetails.id}</Text>
            </View>
          </View>

          <DetailRow 
            label="Document Type" 
            value={userDetails.document_type} 
            icon="document-text"
          />
          <DetailRow 
            label="Document Number" 
            value={userDetails.document_number} 
            icon="card"
          />
          <DetailRow 
            label="Risk Assessment" 
            value={getRiskLevel()} 
            icon="analytics"
            valueColor={getRiskColor()}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle title="Personal Details" icon="person-circle" />
          <DetailRow label="Date of Birth" value={userDetails.date_of_birth} icon="time" />
          <DetailRow 
            label="Address" 
            value={userDetails.address} 
            icon="location" 
            multiline
          />
          {userDetails.user && (
            <>
              <DetailRow label="Email" value={userDetails.user.email} icon="mail" />
              {userDetails.user.phone && (
                <DetailRow label="Phone" value={userDetails.user.phone} icon="call" />
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Document Information" icon="document-text" />
          <DetailRow label="Document Type" value={userDetails.document_type} icon="card" />
          <DetailRow 
            label="Document Number" 
            value={userDetails.document_number} 
            icon="id-card"
          />
        </View>

        {userDetails.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.rejectButton]}
              onPress={handleReject}
            >
              <Text style={styles.buttonText}>Reject Application</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.approveButton]}
              onPress={handleApprove}
            >
              <Text style={styles.buttonText}>Approve KYC</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ 
  label, 
  value, 
  icon, 
  valueColor = Colors.textPrimary,
  multiline = false 
}: any) => (
  <View style={[styles.detailRow, multiline && styles.multilineRow]}>
    <View style={styles.detailLeft}>
      <Ionicons 
        name={icon} 
        size={18} 
        color={Colors.textSecondary} 
        style={styles.rowIcon}
      />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text 
      style={[
        styles.detailValue, 
        { color: valueColor },
        multiline && styles.multilineValue
      ]}
    >
      {value}
    </Text>
  </View>
);

const DocumentRow = ({ type, verified, lastItem }: any) => (
  <View style={[styles.documentRow, !lastItem && styles.documentRowBorder]}>
    <Ionicons 
      name={verified ? "checkmark-circle" : "close-circle"} 
      size={20} 
      color={verified ? Colors.success : Colors.error} 
    />
    <Text style={styles.documentType}>{type}</Text>
    <Text style={[
      styles.documentStatus,
      { color: verified ? Colors.success : Colors.error }
    ]}>
      {verified ? 'Verified' : 'Not Verified'}
    </Text>
  </View>
);

const SectionTitle = ({ title, icon }: any) => (
  <View style={styles.sectionTitle}>
    <Ionicons 
      name={icon} 
      size={20} 
      color={Colors.primary} 
      style={styles.sectionIcon}
    />
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    marginLeft: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  headerSubtext: {
    fontSize: 14,
    color: '#B3C5D7',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userId: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  multilineRow: {
    alignItems: 'flex-start',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
  },
  multilineValue: {
    textAlign: 'right',
    maxWidth: '60%',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  documentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  documentType: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  documentStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default KycDetails;