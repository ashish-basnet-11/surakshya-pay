import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Colors from "@/constants/Colors"; // Adjust path if needed
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ChangePassword = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onChangePasswordPress = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters");
      return;
    }

    // TODO: Add your password update API call here

    Alert.alert("Success", "Password changed successfully!", [
      { text: "OK", onPress: () => router.replace("/login") }, // Navigate to login
    ]);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Change Password</Text>
        </View>

        {/* Card Container wrapping content */}
        <View style={styles.card}>
          {/* Current Password */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Current Password"
              secureTextEntry={!showCurrent}
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity onPress={() => setShowCurrent((v) => !v)}>
              <Ionicons
                name={showCurrent ? "eye" : "eye-off"}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="New Password"
              secureTextEntry={!showNew}
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNew((v) => !v)}>
              <Ionicons
                name={showNew ? "eye" : "eye-off"}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm New Password */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm New Password"
              secureTextEntry={!showConfirm}
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
              <Ionicons
                name={showConfirm ? "eye" : "eye-off"}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={onChangePasswordPress}
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  scroll: {
    paddingVertical: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    flex: 1,
    textAlign: "center",
    marginRight: 80,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#000",
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});
