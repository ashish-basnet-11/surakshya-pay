"use client";

import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { UserCreate } from "@/types/user";
import { useRegisterUser } from "@/apis/users/register-user";
import { showMessage } from "react-native-flash-message";

const Register = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { mutate: registerUser, isPending } = useRegisterUser();

  const onRegisterPress = async () => {
    console.log("Hello");
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long"
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    if (!agreeToTerms) {
      Alert.alert(
        "Terms Required",
        "Please agree to the Terms of Service and Privacy Policy"
      );
      return;
    }

    const user: UserCreate = {
      full_name: `${firstName} ${lastName}`,
      email: email.trim(),
      password: password,
      phone_number: phone.trim(),
    };

    registerUser(user, {
      onSuccess: (data) => {
        if (data.success) {
          showMessage({
            message:
              data.message || "Your account has been created successfully.",
            type: "success",
          });
          router.replace("/login");
        } else {
          showMessage({
            message: data.message || "Failed to create account.",
            type: "danger",
          });
        }
      },
      onError: () => {
        showMessage({
          message: "Failed to create account.",
          type: "danger",
        });
      },
    });
  };

  const goToLogin = () => {
    router.replace("/login");
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
              style={styles.content}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Header Section */}
              <View style={styles.headerSection}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={goToLogin}
                  disabled={isPending}
                  activeOpacity={0.7}
                >
                  <View style={styles.backButtonContainer}>
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={Colors.textInverse}
                    />
                  </View>
                </TouchableOpacity>

                <View style={styles.headerContent}>
                  <View style={styles.logoContainer}>
                    <LinearGradient
                      colors={[Colors.secondary, Colors.secondaryLight]}
                      style={styles.logoGradient}
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={28}
                        color={Colors.textInverse}
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.headerTitle}>Create Account</Text>
                  <Text style={styles.headerSubtitle}>
                    Join thousands of users who trust SurakshyaPay
                  </Text>
                </View>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Personal Information</Text>

                    {/* Name Fields */}
                    <View style={styles.nameRow}>
                      <View style={[styles.inputGroup, styles.nameInput]}>
                        <Text style={styles.inputLabel}>First Name</Text>
                        <View style={styles.inputContainer}>
                          <View style={styles.inputIcon}>
                            <Ionicons
                              name="person-outline"
                              size={20}
                              color={Colors.textSecondary}
                            />
                          </View>
                          <TextInput
                            placeholder="First Name"
                            placeholderTextColor={Colors.textTertiary}
                            style={styles.input}
                            autoCapitalize="words"
                            value={firstName}
                            onChangeText={setFirstName}
                            editable={!isPending}
                          />
                        </View>
                      </View>

                      <View style={[styles.inputGroup, styles.nameInput]}>
                        <Text style={styles.inputLabel}>Last Name</Text>
                        <View style={styles.inputContainer}>
                          <View style={styles.inputIcon}>
                            <Ionicons
                              name="person-outline"
                              size={20}
                              color={Colors.textSecondary}
                            />
                          </View>
                          <TextInput
                            placeholder="Last Name"
                            placeholderTextColor={Colors.textTertiary}
                            style={styles.input}
                            autoCapitalize="words"
                            value={lastName}
                            onChangeText={setLastName}
                            editable={!isPending}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Email Address</Text>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIcon}>
                          <Ionicons
                            name="mail-outline"
                            size={20}
                            color={Colors.textSecondary}
                          />
                        </View>
                        <TextInput
                          placeholder="Enter Email"
                          placeholderTextColor={Colors.textTertiary}
                          style={styles.input}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={email}
                          onChangeText={setEmail}
                          editable={!isPending}
                        />
                      </View>
                    </View>

                    {/* Phone Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Phone Number</Text>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIcon}>
                          <Ionicons
                            name="call-outline"
                            size={20}
                            color={Colors.textSecondary}
                          />
                        </View>
                        <TextInput
                          placeholder="+1 (555) 123-4567"
                          placeholderTextColor={Colors.textTertiary}
                          style={styles.input}
                          keyboardType="phone-pad"
                          value={phone}
                          onChangeText={setPhone}
                          editable={!isPending}
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
                          placeholder="Create a strong password"
                          placeholderTextColor={Colors.textTertiary}
                          secureTextEntry={!showPassword}
                          style={styles.input}
                          value={password}
                          onChangeText={setPassword}
                          editable={!isPending}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword((prev) => !prev)}
                          style={styles.passwordToggle}
                          disabled={isPending}
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
                      <Text style={styles.passwordHint}>
                        Must be at least 8 characters long
                      </Text>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Confirm Password</Text>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIcon}>
                          <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={Colors.textSecondary}
                          />
                        </View>
                        <TextInput
                          placeholder="Confirm your password"
                          placeholderTextColor={Colors.textTertiary}
                          secureTextEntry={!showConfirmPassword}
                          style={styles.input}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          editable={!isPending}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          style={styles.passwordToggle}
                          disabled={isPending}
                        >
                          <Ionicons
                            name={
                              showConfirmPassword
                                ? "eye-outline"
                                : "eye-off-outline"
                            }
                            size={20}
                            color={Colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Terms Agreement */}
                    <TouchableOpacity
                      style={styles.termsContainer}
                      onPress={() => setAgreeToTerms((prev) => !prev)}
                      disabled={isPending}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          agreeToTerms && styles.checkboxActive,
                        ]}
                      >
                        {agreeToTerms && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={Colors.textInverse}
                          />
                        )}
                      </View>
                      <View style={styles.termsTextContainer}>
                        <Text style={styles.termsText}>
                          I agree to the{" "}
                          <Text style={styles.termsLink}>Terms of Service</Text>{" "}
                          and{" "}
                          <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Register Button */}
                    <TouchableOpacity
                      style={[
                        styles.registerButton,
                        isPending && styles.registerButtonDisabled,
                      ]}
                      onPress={onRegisterPress}
                      disabled={isPending}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          isPending
                            ? [Colors.neutral400, Colors.neutral500]
                            : [Colors.secondary, Colors.secondaryLight]
                        }
                        style={styles.registerButtonGradient}
                      >
                        {isPending ? (
                          <View style={styles.loadingContainer}>
                            <View style={styles.loadingSpinner} />
                            <Text style={styles.registerButtonText}>
                              Creating Account...
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.registerButtonText}>
                            Create Account
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    {/* <View style={styles.dividerContainer}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or sign up with</Text>
                      <View style={styles.dividerLine} />
                    </View> */}

                    {/* Social Register */}
                    {/* <View style={styles.socialContainer}>
                      <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => onSocialRegister("Google")}
                        disabled={isPending}
                        activeOpacity={0.7}
                      >
                        <View style={styles.socialIcon}>
                          <Ionicons name="logo-google" size={20} color="#EA4335" />
                        </View>
                        <Text style={styles.socialButtonText}>Google</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => onSocialRegister("Apple")}
                        disabled={isPending}
                        activeOpacity={0.7}
                      >
                        <View style={styles.socialIcon}>
                          <Ionicons name="logo-apple" size={20} color={Colors.textPrimary} />
                        </View>
                        <Text style={styles.socialButtonText}>Apple</Text>
                      </TouchableOpacity>
                    </View> */}

                    {/* Sign In Link */}
                    <View style={styles.signInContainer}>
                      <Text style={styles.signInText}>
                        Already have an account?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={goToLogin}
                        disabled={isPending}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.signInLink}>Sign In</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </LinearGradient>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default Register;

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
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 24,
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
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textInverse,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
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
  scrollContent: {
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
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
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
  passwordHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    fontWeight: "500",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontWeight: "500",
  },
  termsLink: {
    color: Colors.secondary,
    fontWeight: "600",
  },
  registerButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
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
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  signInLink: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: "700",
  },
});
