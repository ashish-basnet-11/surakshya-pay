import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <TouchableOpacity>
          <Image
            source={
              image ? { uri: image } : require('@/assets/images/profile.png')
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.name}>Eleanor Pinas</Text>
      </View>

      <View style={styles.box}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push('/(tabs)/(settings)/profile-details')}
        >
          <MaterialIcons name="person" size={24} color={Colors.primary} />
          <Text style={styles.itemText}>Profile Details</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push('/(tabs)/(settings)/transaction-settings')}
        >
          <Ionicons name="swap-horizontal" size={24} color={Colors.primary} />
          <Text style={styles.itemText}>Transaction Settings</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push('/(tabs)/(settings)/security-settings')}
        >
          <Feather name="lock" size={24} color={Colors.primary} />
          <Text style={styles.itemText}>Security Settings</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push('/(tabs)/(settings)/general-settings')}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.primary} />
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
    justifyContent: 'flex-end',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 50,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.secondary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
  },
  box: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    marginTop: 40,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 15,
  },
  logoutItem: {
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 25,
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
