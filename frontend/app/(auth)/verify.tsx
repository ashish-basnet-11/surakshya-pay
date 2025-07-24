"use client"

import { useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Colors from "@/constants/Colors"

const Verify = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/
    return re.test(email)
  }

  const onSendOtp = () => {
    if (!email) {
      Alert.alert("Missing Email", "Please enter your email address")
      return
    }
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/otp")
    }, 1500)
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.container}>

          {/* Header */}
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.headerGradient}>
          <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/login")}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonContainer}>
                <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
              </View>
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <LinearGradient colors={[Colors.info, "#60A5FA"]} style={styles.iconGradient}>
                  <Ionicons name="mail-outline" size={32} color={Colors.textInverse} />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>Forgot Password?</Text>
              <Text style={styles.headerSubtitle}>
                Don't worry! Enter your email address and we'll send you a verification code to reset your password.
              </Text>
            </View>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Reset Password</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    placeholder="Enter your email address"
                    placeholderTextColor={Colors.textTertiary}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    editable={!isLoading}
                    selectionColor={Colors.secondary}
                  />
                  {email ? (
                    <TouchableOpacity style={styles.clearButton} onPress={() => setEmail("")} disabled={isLoading}>
                      <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.sendButton, (!email || isLoading) && styles.sendButtonDisabled]}
                onPress={onSendOtp}
                disabled={!email || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    !email || isLoading
                      ? [Colors.neutral400, Colors.neutral500]
                      : [Colors.secondary, Colors.secondaryLight]
                  }
                  style={styles.sendButtonGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.loadingSpinner} />
                      <Text style={styles.sendButtonText}>Sending...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="send" size={20} color={Colors.textInverse} />
                      <Text style={styles.sendButtonText}>Send Verification Code</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.helpSection}>
                <View style={styles.helpCard}>
                  <View style={styles.helpIcon}>
                    <Ionicons name="information-circle" size={20} color={Colors.info} />
                  </View>
                  <View style={styles.helpContent}>
                    <Text style={styles.helpTitle}>Need Help?</Text>
                    <Text style={styles.helpText}>
                      If you don't receive the email within a few minutes, please check your spam folder or contact
                      support.
                    </Text>
                  </View>
                </View>
              </View>

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
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

export default Verify

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
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
    marginBottom: 32,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sendButtonText: {
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
