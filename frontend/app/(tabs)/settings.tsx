import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ConfirmModal from './ConfirmModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Settings = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleLogout = () => setConfirmVisible(true);
  const confirmLogout = () => {
    setConfirmVisible(false);
    router.replace('/(auth)/login');
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission required', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permission required', 'Media library permission is required to select photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const onEditImagePress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            openCamera();
          } else if (buttonIndex === 2) {
            openGallery();
          }
        }
      );
    } else {
      Alert.alert(
        'Select Photo',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: openCamera },
          { text: 'Choose from Gallery', onPress: openGallery },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={styles.profileHeading}>Profile</Text>

        <TouchableOpacity activeOpacity={0.9} onPress={onEditImagePress}>
          <Image
            source={
              image ? { uri: image } : require('@/assets/images/profile.png')
            }
            style={styles.profileImage}
          />
          <View style={styles.editIconWrapper}>
            <MaterialIcons name="edit" size={24} color="#4CAF50" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>Eleanor Pinas</Text>
        <Text style={styles.email}>eleanor.pinas@example.com</Text>
      </View>

      <View style={styles.box}>
        <TouchableOpacity
          style={[styles.item, { borderBottomWidth: 1 }]}
          onPress={() => router.push('/(tabs)/(settings)/profile-details')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#e6f4ea' }]}>
            <MaterialIcons name="person" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.itemText}>Profile Details</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.item, { borderBottomWidth: 1 }]}
          onPress={() => router.push('/(tabs)/(settings)/transaction-settings')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#fff3e0' }]}>
            <Ionicons name="swap-horizontal" size={24} color="#FF9800" />
          </View>
          <Text style={styles.itemText}>Transaction Settings</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.item, { borderBottomWidth: 1 }]}
          onPress={() => router.push('/(tabs)/(settings)/security-settings')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#e3f2fd' }]}>
            <Feather name="lock" size={24} color="#2196F3" />
          </View>
          <Text style={styles.itemText}>Security Settings</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.item, { borderBottomWidth: 0 }]}
          onPress={() => router.push('/(tabs)/(settings)/general-settings')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#f3e5f5' }]}>
            <Ionicons name="settings-outline" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.itemText}>General Settings</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
          <View style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={confirmVisible}
        title="Logout"
        message="Do you want to logout?"
        onConfirm={confirmLogout}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 25,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 75,
    backgroundColor: Colors.secondary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editIconWrapper: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#e6f4ea',
    borderRadius: 20,
    padding: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    color: '#d0d6db',
    marginTop: 4,
  },
  box: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
   
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderRadius: 12,
    marginVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 1,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
  },
  logoutItem: {
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
