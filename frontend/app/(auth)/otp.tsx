"use client"

import { useState, useRef, useEffect } from "react"
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

const Otp = () => {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const isOtpValid = otp.length === 6

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleChangeText = (text: string) => {
    if (text.length <= 6 && /^\d*$/.test(text)) {
      setOtp(text)
    }
  }

  const handleVerify = async () => {
    if (!isOtpValid) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit OTP code.")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.replace("/changePassword")
    } catch (error) {
      Alert.alert("Error", "Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    setCanResend(false)
    setResendTimer(30)
    setOtp("")

    // Restart timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    Alert.alert("OTP Sent", "A new verification code has been sent to your phone.")
  }

  const handleOtpBoxPress = () => {
    inputRef.current?.focus()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

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
                <LinearGradient colors={[Colors.secondary, Colors.secondaryLight]} style={styles.iconGradient}>
                  <Ionicons name="shield-checkmark" size={32} color={Colors.textInverse} />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>Verify Code</Text>
              <Text style={styles.headerSubtitle}>
                We've sent a 6-digit verification code to your registered phone number ending in ****67. Please enter it
                below.
              </Text>
            </View>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              {/* OTP Input */}
              <View style={styles.otpGroup}>
                <TouchableOpacity activeOpacity={1} onPress={handleOtpBoxPress}>
                  <View style={styles.otpInputContainer}>
                    {[...Array(6)].map((_, i) => (
                      <View
                        key={i}
                        style={[styles.otpBox, otp[i] && styles.otpBoxFilled, i === otp.length && styles.otpBoxActive]}
                      >
                        <Text style={[styles.otpText, otp[i] && styles.otpTextFilled]}>{otp[i] || ""}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>

                <TextInput
                  ref={inputRef}
                  value={otp}
                  onChangeText={handleChangeText}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.hiddenInput}
                  autoFocus
                  caretHidden={false}
                  editable={!isLoading}
                />
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.verifyButton, (!isOtpValid || isLoading) && styles.verifyButtonDisabled]}
                onPress={handleVerify}
                disabled={!isOtpValid || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    !isOtpValid || isLoading
                      ? [Colors.neutral400, Colors.neutral500]
                      : [Colors.secondary, Colors.secondaryLight]
                  }
                  style={styles.verifyButtonGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.loadingSpinner} />
                      <Text style={styles.verifyButtonText}>Verifying...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.textInverse} />
                      <Text style={styles.verifyButtonText}>Verify Code</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend Section */}
              <View style={styles.resendSection}>
                {!canResend ? (
                  <View style={styles.timerContainer}>
                    <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.timerText}>Resend code in {formatTime(resendTimer)}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.resendButton} onPress={handleResend} activeOpacity={0.7}>
                    <Ionicons name="refresh" size={16} color={Colors.secondary} />
                    <Text style={styles.resendText}>Resend Verification Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Help Section */}
              <View style={styles.helpSection}>
                <View style={styles.helpCard}>
                  <View style={styles.helpIcon}>
                    <Ionicons name="information-circle" size={20} color={Colors.info} />
                  </View>
                  <View style={styles.helpContent}>
                    <Text style={styles.helpTitle}>Didn't receive the code?</Text>
                    <Text style={styles.helpText}>
                      Check your messages or wait for the timer to resend. Contact support if you continue having
                      issues.
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
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

export default Otp

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
  otpGroup: {
    marginBottom: 32,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backgroundTertiary,
  },
  otpBoxFilled: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary + "10",
  },
  otpBoxActive: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary + "05",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  otpText: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textTertiary,
  },
  otpTextFilled: {
    color: Colors.textPrimary,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  verifyButton: {
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifyButtonText: {
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
  resendSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginLeft: 8,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary + "15",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resendText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: "700",
    marginLeft: 8,
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
