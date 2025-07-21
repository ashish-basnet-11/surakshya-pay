"use client";

import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const Login = () => {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleRememberMe = () => setRememberMe((prev) => !prev);
  const onForgotPasswordPress = () => router.push("/(auth)/verify");
  const onRegisterPress = () => router.push("/register");

  const onLoginPress = async () => {
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/");
    }, 1500);
  };

  const onSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.content}
            >
              {/* Header Section */}
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoWrapper}>
                    <LinearGradient
                      colors={[Colors.secondary, Colors.secondaryLight]}
                      style={styles.logoGradient}
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={32}
                        color={Colors.textInverse}
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.brandName}>SurakshyaPay</Text>
                  <Text style={styles.brandTagline}>
                    Secure Digital Payments
                  </Text>
                </View>

                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeTitle}>Welcome Back</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Sign in to access your secure digital wallet
                  </Text>
                </View>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                <View style={styles.formContainer}>
                  <Text style={styles.formTitle}>Sign In</Text>

                  {/* Username Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email or Username</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIcon}>
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color={Colors.textSecondary}
                        />
                      </View>
                      <TextInput
                        placeholder="Enter your email or username"
                        placeholderTextColor={Colors.textTertiary}
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={username}
                        onChangeText={setUsername}
                        editable={!isLoading}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIcon}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color={Colors.textSecondary}
                        />
                      </View>
                      <TextInput
                        placeholder="Enter your password"
                        placeholderTextColor={Colors.textTertiary}
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={styles.passwordToggle}
                        disabled={isLoading}
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-outline" : "eye-off-outline"
                          }
                          size={20}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Remember Me & Forgot Password */}
                  <View style={styles.optionsRow}>
                    <TouchableOpacity
                      style={styles.rememberMeContainer}
                      onPress={toggleRememberMe}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          rememberMe && styles.checkboxActive,
                        ]}
                      >
                        {rememberMe && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={Colors.textInverse}
                          />
                        )}
                      </View>
                      <Text style={styles.rememberMeText}>Remember me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={onForgotPasswordPress}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.forgotPasswordText}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      isLoading && styles.loginButtonDisabled,
                    ]}
                    onPress={onLoginPress}
                    disabled={isLoading || !username.trim() || !password.trim()}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isLoading || !username.trim() || !password.trim()
                          ? [Colors.neutral400, Colors.neutral500]
                          : [Colors.secondary, Colors.secondaryLight]
                      }
                      style={styles.loginButtonGradient}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <View style={styles.loadingSpinner} />
                          <Text style={styles.loginButtonText}>
                            Signing In...
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.loginButtonText}>Sign In</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider */}
                  {/* <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View> */}

                  {/* Social Login */}
                  {/* <View style={styles.socialContainer}>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => onSocialLogin("Google")}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <View style={styles.socialIcon}>
                        <Ionicons name="logo-google" size={20} color="#EA4335" />
                      </View>
                      <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => onSocialLogin("Apple")}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <View style={styles.socialIcon}>
                        <Ionicons name="logo-apple" size={20} color={Colors.textPrimary} />
                      </View>
                      <Text style={styles.socialButtonText}>Apple</Text>
                    </TouchableOpacity>
                  </View> */}

                  {/* Sign Up Link */}
                  <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>
                      Don't have an account?{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={onRegisterPress}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.signUpLink}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    marginBottom: 16,
  },
  logoGradient: {
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
  brandName: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textInverse,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: Colors.neutral300,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  welcomeContainer: {
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textInverse,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.neutral300,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
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
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  rememberMeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: "600",
  },
  loginButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: "700",
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 16,
    fontWeight: "500",
  },
  socialContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  socialIcon: {
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 32,
  },
  signUpText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  signUpLink: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: "700",
  },
});
