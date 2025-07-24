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
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import * as LocalAuthentication from "expo-local-authentication";
import { useUserLogin } from "@/apis/authentication/login-user";
import { UserLogin } from "@/types/user";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const Login = () => {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: loginUser, isPending: isLoading } = useUserLogin();

  const toggleRememberMe = () => setRememberMe((prev) => !prev);
  const onForgotPasswordPress = () => router.push("/(auth)/verify");
  const onRegisterPress = () => router.push("/register");

  const onLoginPress = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
    const user: UserLogin = {
      username: username.trim(),
      password: password,
    };

    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("password", user.password);

    loginUser(formData, {
      onSuccess: (authResult) => {
        console.log(authResult);
        // if (authResult.success) {
        //   router.replace("/(admin)/dashboard");
        // } else {
        //   router.replace("/(tabs)");
        // }
        if (authResult.success) {
          Alert.alert("Login Successful", "You are logged in successfully");
          router.replace("/(tabs)");
        } else {
          Alert.alert(
            "Login Failed",
            authResult.message || "An error occurred during login"
          );
        }
      },
      onError: (error: any) => {
        Alert.alert(
          "Login Failed",
          error.message || "An error occurred during login"
        );
      },
    });
  };

  const handleFingerprintLogin = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const supported =
      await LocalAuthentication.supportedAuthenticationTypesAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || supported.length === 0 || !enrolled) {
      Alert.alert("Unavailable", "Biometric authentication is not set up");
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate with fingerprint to login",
      fallbackLabel: "Enter password",
      disableDeviceFallback: true,
    });
    if (result.success) {
      router.replace("/(tabs)");
      // const user = MOCK_USERS.user1;
      // if (user.role === "admin") {
      //   router.replace("/(admin)/dashboard");
      // } else {
      // }
    } else {
      Alert.alert("Authentication Failed", "Fingerprint did not match");
    }
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
            <View style={styles.content}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerSection}
              >
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
              </LinearGradient>

              <View style={styles.formSection}>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollViewContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                >
                  <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Sign In</Text>

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
                    <View style={styles.loginRow}>
                      <TouchableOpacity
                        style={[
                          styles.loginButtonFlex,
                          isLoading && styles.loginButtonDisabled,
                        ]}
                        onPress={onLoginPress}
                        disabled={
                          isLoading || !username.trim() || !password.trim()
                        }
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={
                            isLoading || !username.trim() || !password.trim()
                              ? [Colors.neutral400, Colors.neutral500]
                              : [Colors.secondary, Colors.secondaryLight]
                          }
                          style={[styles.loginButtonGradient, { flex: 1 }]}
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

                      <TouchableOpacity
                        style={styles.fingerprintButton}
                        onPress={handleFingerprintLogin}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="finger-print"
                          size={28}
                          color={Colors.secondary}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.signUpContainer}>
                      <Text style={styles.signUpText}>
                        Don&apos;t have an account?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={onRegisterPress}
                        disabled={isLoading}
                      >
                        <Text style={styles.signUpLink}>Sign Up</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
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
    minHeight: SCREEN_HEIGHT * 0.4,
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
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 32,
    paddingHorizontal: 24,
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
    marginBottom: 32,
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
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 12,
  },
  loginButtonFlex: {
    flex: 1,
    borderRadius: 16,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fingerprintButton: {
    width: 52,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
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
