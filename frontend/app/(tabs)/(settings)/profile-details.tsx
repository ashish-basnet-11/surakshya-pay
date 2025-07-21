import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";

const ProfileDetails = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  const goBackToSettings = () => {
    router.push('/settings');
  };

  const onEditPress = () => {
    Alert.alert('Edit Profile Picture', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.granted) {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });
            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          } else {
            Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });
          if (!result.canceled) {
            setImage(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Remove Photo',
        style: 'destructive',
        onPress: () => setImage(null),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Choose what you would like to edit:',
      [
        {
          text: 'Personal Information',
          onPress: () => Alert.alert('Edit Info', 'Personal information editing would open here.'),
        },
        {
          text: 'Contact Details',
          onPress: () => Alert.alert('Edit Contact', 'Contact details editing would open here.'),
        },
        {
          text: 'Security Settings',
          onPress: () => router.push('/(tabs)/(settings)/security-settings'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const profileData = [
    {
      id: 'phone',
      label: 'Phone Number',
      value: '+1 (555) 123-4567',
      icon: 'call',
      color: '#4CAF50',
      editable: true,
    },
    {
      id: 'email',
      label: 'Email Address',
      value: 'eleanor.pena@email.com',
      icon: 'mail',
      color: '#2196F3',
      editable: true,
    },
    {
      id: 'address',
      label: 'Address',
      value: '123 Main Street, New York, NY 10001',
      icon: 'location',
      color: '#FF9800',
      editable: true,
    },
    {
      id: 'joined',
      label: 'Member Since',
      value: 'July 15, 2024',
      icon: 'calendar',
      color: '#9C27B0',
      editable: false,
    },
    {
      id: 'verification',
      label: 'Verification Status',
      value: 'Verified Account',
      icon: 'checkmark-circle',
      color: '#4CAF50',
      editable: false,
      verified: true,
    },
  ];

  const renderProfileItem = (item: typeof profileData[0], index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.profileItem,
        index === profileData.length - 1 && styles.profileItemLast,
      ]}
      onPress={() => {
        if (item.editable) {
          Alert.alert(`Edit ${item.label}`, `Would you like to edit your ${item.label.toLowerCase()}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Edit', onPress: () => Alert.alert('Edit', `${item.label} editing would open here.`) },
          ]);
        }
      }}
      activeOpacity={item.editable ? 0.7 : 1}
    >
      <View style={styles.itemContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
          <Ionicons name={item.icon as any} size={20} color={item.color} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>{item.label}</Text>
          <View style={styles.itemValueContainer}>
            <Text style={styles.itemValue} numberOfLines={2}>
              {item.value}
            </Text>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              </View>
            )}
          </View>
        </View>
        {item.editable && (
          <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
         <LinearGradient
          colors={[
            Colors.primary,
            Colors.primaryLight,
            Colors.backgroundSecondary,
          ]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goBackToSettings}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Profile Details</Text>
            <Text style={styles.headerSubtext}>Manage your account information</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <View style={styles.imageWrapper}>
                <Image
                  source={image ? { uri: image } : require('@/assets/images/profile.png')}
                  style={styles.profileImage}
                />
                <TouchableOpacity onPress={onEditPress} style={styles.editImageButton}>
                  <Ionicons name="camera" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Eleanor Pena</Text>
              <Text style={styles.profileEmail}>Premium Member</Text>
              <View style={styles.membershipBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.membershipText}>Gold Member</Text>
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.sectionContent}>
              {profileData.map((item, index) => renderProfileItem(item, index))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default ProfileDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContent: {
    flex: 1,
    paddingLeft: 10,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: "#ffffff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  profileItemLast: {
    borderBottomWidth: 0,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 2,
  },
  itemValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 16,
    color: '#1C1C1E',
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});