"use client"

import { useState } from "react"
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
  StatusBar,
  SafeAreaView,
} from "react-native"
import Colors from "@/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { ResetPasswordInterface } from "@/types/authentication"
import { useResetPassword } from "@/apis/authentication/reset-password";
import { useForgotPasswordStore } from "@/store/user-forgot-password-store"

const ChangePassword = () => {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutate: ResetPassword, isPending: isLoading } = useResetPassword();

  
  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    Object.values(checks).forEach((check) => {
      if (check) strength++
    })

    return { strength, checks }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return Colors.error
    if (strength <= 3) return Colors.warning
    if (strength <= 4) return Colors.info
    return Colors.success
  }

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Fair"
    if (strength <= 4) return "Good"
    return "Strong"
  }

  const onChangePasswordPress = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Missing Information", "Please fill all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      Alert.alert("Weak Password", "Password should be at least 8 characters")
      return
    }

    if (passwordStrength.strength < 3) {
      Alert.alert(
        "Weak Password",
        "Please create a stronger password with uppercase, lowercase, numbers, and special characters",
      )
      return
    }

   
  const email = useForgotPasswordStore.getState().email || "";
  const otp = useForgotPasswordStore.getState().otp || "";

  const props: ResetPasswordInterface = {
    email,
    otp,
    new_password: newPassword,
  };

  ResetPassword(props, {
    onSuccess: (res) => {
      if (res.success) {
        Alert.alert("Success", "Password changed successfully!", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
      } else {
        Alert.alert("Reset password failed", res.message || "Unknown error");
      }
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Something went wrong");
    },
  });
};
      
  //     await new Promise((resolve) => setTimeout(resolve, 1500))

  //     Alert.alert("Success", "Password changed successfully!", [
  //       { text: "OK", onPress: () => router.replace("/login") },
  //     ])
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to change password. Please try again.")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.content}>
          {/* Header */}
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.headerGradient}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonContainer}>
                <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
              </View>
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <LinearGradient colors={[Colors.warning, "#FCD34D"]} style={styles.iconGradient}>
                  <Ionicons name="lock-closed" size={32} color={Colors.textInverse} />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>Create New Password</Text>
              <Text style={styles.headerSubtitle}>
                Your new password must be different from your previous password and meet our security requirements.
              </Text>
            </View>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formSection}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Reset Password</Text>

                {/* New Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                    </View>
                    <TextInput
                      placeholder="Create a strong password"
                      placeholderTextColor={Colors.textTertiary}
                      secureTextEntry={!showNew}
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      editable={!isLoading}
                      selectionColor={Colors.secondary}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNew((v) => !v)}
                      style={styles.passwordToggle}
                      disabled={isLoading}
                    >
                      <Ionicons
                        name={showNew ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Password Strength Indicator */}
                  {newPassword.length > 0 && (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthHeader}>
                        <Text style={styles.strengthLabel}>Password Strength</Text>
                        <Text style={[styles.strengthText, { color: getStrengthColor(passwordStrength.strength) }]}>
                          {getStrengthText(passwordStrength.strength)}
                        </Text>
                      </View>
                      <View style={styles.strengthBar}>
                        <View
                          style={[
                            styles.strengthFill,
                            {
                              width: `${(passwordStrength.strength / 5) * 100}%`,
                              backgroundColor: getStrengthColor(passwordStrength.strength),
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.strengthChecks}>
                        {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                          <View key={key} style={styles.strengthCheck}>
                            <Ionicons
                              name={passed ? "checkmark-circle" : "close-circle"}
                              size={14}
                              color={passed ? Colors.success : Colors.neutral400}
                            />
                            <Text
                              style={[styles.strengthCheckText, { color: passed ? Colors.success : Colors.neutral400 }]}
                            >
                              {key === "length" && "8+ characters"}
                              {key === "uppercase" && "Uppercase"}
                              {key === "lowercase" && "Lowercase"}
                              {key === "number" && "Number"}
                              {key === "special" && "Special char"}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      confirmPassword && newPassword !== confirmPassword && styles.inputError,
                    ]}
                  >
                    <View style={styles.inputIcon}>
                      <Ionicons name="checkmark-circle-outline" size={20} color={Colors.textSecondary} />
                    </View>
                    <TextInput
                      placeholder="Confirm your new password"
                      placeholderTextColor={Colors.textTertiary}
                      secureTextEntry={!showConfirm}
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      editable={!isLoading}
                      selectionColor={Colors.secondary}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirm((v) => !v)}
                      style={styles.passwordToggle}
                      disabled={isLoading}
                    >
                      <Ionicons
                        name={showConfirm ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <Text style={styles.errorText}>Passwords do not match</Text>
                  )}
                </View>

                {/* Change Password Button */}
                <TouchableOpacity
                  style={[
                    styles.changeButton,
                    (!newPassword || !confirmPassword || isLoading) && styles.changeButtonDisabled,
                  ]}
                  onPress={onChangePasswordPress}
                  disabled={!newPassword || !confirmPassword || isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      !newPassword || !confirmPassword || isLoading
                        ? [Colors.neutral400, Colors.neutral500]
                        : [Colors.warning, "#FCD34D"]
                    }
                    style={styles.changeButtonGradient}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <View style={styles.loadingSpinner} />
                        <Text style={styles.changeButtonText}>Updating Password...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Ionicons name="shield-checkmark" size={20} color={Colors.textInverse} />
                        <Text style={styles.changeButtonText}>Update Password</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Security Tips */}
                <View style={styles.helpSection}>
                  <View style={styles.helpCard}>
                    <View style={styles.helpIcon}>
                      <Ionicons name="information-circle" size={20} color={Colors.info} />
                    </View>
                    <View style={styles.helpContent}>
                      <Text style={styles.helpTitle}>Security Tips</Text>
                      <Text style={styles.helpText}>
                        Use a unique password that you don&apos;t use elsewhere. Consider using a password manager for better
                        security.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Back to Login */}
                <TouchableOpacity
                  style={styles.backToLoginButton}
                  onPress={() => router.replace("/login")}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={16} color={Colors.secondary} />
                  <Text style={styles.backToLoginText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

export default ChangePassword

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
  },
  content: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 32,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textInverse,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.neutral300,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
    paddingHorizontal: 8,
  },
  formSection: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 24,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 32,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + "05",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  passwordToggle: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 6,
    fontWeight: "500",
  },
  strengthContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  strengthBar: {
    height: 4,
    backgroundColor: Colors.neutral200,
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthChecks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  strengthCheck: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  strengthCheckText: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
  },
  changeButton: {
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  changeButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  changeButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeButtonText: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textInverse,
    borderTopColor: "transparent",
    marginRight: 12,
  },
  helpSection: {
    marginBottom: 32,
  },
  helpCard: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  helpIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontWeight: "500",
  },
  backToLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  backToLoginText: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: "600",
    marginLeft: 8,
  },
})
