import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

const EditPersonalInfo = () => {
  const router = useRouter();
  const [name, setName] = useState("Eleanor Pena");
  const [email, setEmail] = useState("eleanor.pena@email.com");
  const [phone, setPhone] = useState("+977 9812345678");
  const [address, setAddress] = useState("Kathmandu, Nepal");
  
    useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/(tabs)/(settings)/profile-details'); 
        return true;
      };
  
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
  
      return () => backHandler.remove();
    }, [])
  );


  const handleSave = () => {
    Alert.alert("Success", "Your personal information has been saved.");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/(settings)/profile-details")}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Personal Information</Text>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={90}
        >
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <Text style={styles.sectionSubtitle}>
                Update your personal details
              </Text>

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textSecondary}
                  returnKeyType="next"
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Enter your address"
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color={Colors.textInverse}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 20,
    backgroundColor: Colors.primary,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 25,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textInverse,
  },
  headerRight: {
    width: 40,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100, 
    flexGrow: 1,
    marginTop: 10,
    marginLeft: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    paddingBottom: 30, 
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: Colors.textInverse,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default EditPersonalInfo;