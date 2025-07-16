import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileDetails = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="person" size={26} color="#fff" />
        <Text style={styles.headerText}>Profile Details</Text>
      </View>

      <View style={styles.card}>
        <Image
          source={require('@/assets/images/profile.png')}
          style={styles.profileImage}
        />
        <Text style={styles.name}>Eleanor Pinas</Text>
        <Text style={styles.email}>eleanor@email.com</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>+977 9800000000</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>New Baneshwor, Kathmandu</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Joined Date</Text>
          <Text style={styles.value}>July 15, 2024</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  email: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },
  field: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    color: '#888',
    fontSize: 14,
    marginBottom: 3,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
