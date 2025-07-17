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
} from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const ProfileDetails = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  const goBackToSettings = () => {
    router.push('/settings');
  };

  const onEditPress = () => {
    Alert.alert('Edit Profile', 'Choose an option', [
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
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackToSettings} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View>
            <Image
              source={image ? { uri: image } : require('@/assets/images/profile.png')}
              style={styles.profileImage}
            />
            <TouchableOpacity onPress={onEditPress} style={styles.editIconWrapper}>
              <MaterialIcons name="edit" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Eleanor Pinas</Text>
          <Text style={styles.email}>eleanor@email.com</Text>
        </View>

        {/* Phone box */}
        <TouchableOpacity style={[styles.item, { borderBottomWidth: 1 }]}>
          <View style={[styles.iconWrapper, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="call" size={24} color="#fff" />
          </View>
          <Text style={styles.itemText}>+977 9800000000</Text>
        </TouchableOpacity>

        {/* Address box */}
        <TouchableOpacity style={[styles.item, { borderBottomWidth: 1 }]}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FF9800' }]}>
            <Entypo name="location-pin" size={24} color="#fff" />
          </View>
          <Text style={styles.itemText}>New Baneshwor, Kathmandu</Text>
        </TouchableOpacity>

        {/* Joined Date box */}
        <TouchableOpacity style={[styles.item, { borderBottomWidth: 0 }]}>
          <View style={[styles.iconWrapper, { backgroundColor: '#2196F3' }]}>
            <MaterialIcons name="calendar-today" size={24} color="#fff" />
          </View>
          <Text style={styles.itemText}>July 15, 2024</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.editButton} onPress={() => alert('Edit Profile')}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerText: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 10,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#777',
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
  editButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 3 },
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
