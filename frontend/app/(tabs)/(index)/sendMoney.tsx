import React, { useState, useCallback, useLayoutEffect, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  TextInput,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Colors from "@/constants/Colors";
import { showMessage } from "react-native-flash-message";
import { useTransferMoney } from "@/apis/transaction/transfer-money";
import { TransferInterface } from "@/types/transaction";

const QUICK_AMOUNTS = [20, 100, 250, 500];
const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "<"],
];

const SendMoney = () => {
  const { qrData } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [isAmountVisible, setIsAmountVisible] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));
  const {mutate: transferMoney, isPending: isProcessing} = useTransferMoney();

  const numAmount = Number(amount);
  const isAmountValid = amount !== "" && !isNaN(numAmount) && numAmount > 0;

  useEffect(() => {
    if(qrData){
      setUsername(qrData.toLocaleString());
    }
  }, [qrData])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(tabs)");
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => backHandler.remove();
    }, [router])
  );

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) parent.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      if (parent) parent.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  const onKeyPress = (key: string) => {
    if (isProcessing) return;
    if (key === "<") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === ".") {
      if (!amount.includes(".") && amount.length > 0) {
        setAmount((prev) => prev + ".");
      }
    } else if (amount.length < 8) {
      setAmount((prev) => prev + key);
    }
  };

  const formatAmount = (val: string) => {
    const n = parseFloat(val);
    return isNaN(n) ? "0" : n.toLocaleString("en-US");
  };

  const setQuickAmount = (val: number) => setAmount(val.toString());

  const handleSend = async () => {
    if (!username.trim()) {
      showMessage({
        message: "Please enter a recipient username..",
        type: "warning",
      });
      return;
    }
    if (!isAmountValid) {
      showMessage({
        message: "Please enter a valid amount.",
        type: "warning",
      });
      return;
    }

    try {
      const props : TransferInterface = {
        to_username: username,
        amount: Number(amount),
        category: purpose && purpose.trim() !== "" ? purpose.trim() : undefined
      }

      console.log(props);

      transferMoney(props, {
        onSuccess: (data) => {
          console.log(data);
          if (data.success) {
            showMessage({
              message: data.message || "Money transfered successfully!",
              type: "success",
            });
            router.push("/(tabs)");
          } else {
            showMessage({
              message: data.message || "Failed to transfer Money!",
              type: "danger",
            });
          }
        },
        onError: () => {
          showMessage({
            message: "Failed to transfer Money!",
            type: "danger",
          });
        },
      });
    } catch {
      showMessage({
        message: "Failed to transfer money!",
        type: "danger",
      });
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={styles.backButton}
            activeOpacity={0.7}
            disabled={isProcessing}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isProcessing ? "#B3C5D7" : "#fff"}
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Send Money</Text>
            <Text style={styles.headerSubtext}>
              Transfer to another account
            </Text>
          </View>
        </View>

        <View style={styles.usernameSection}>
          <TextInput
            style={styles.usernameInput}
            placeholder="Enter recipient username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            editable={!isProcessing}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          {/* <TextInput
            style={styles.purposeInput}
            placeholder="Enter Purpose"
            placeholderTextColor="#999"
            value={purpose}
            onChangeText={setPurpose}
            editable={!isProcessing}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          /> */}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.content}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[styles.animatedContainer, { opacity: fadeAnim }]}
            >
              <View style={styles.amountSection}>
                <Text style={styles.currencySymbol}>NPR</Text>
                <View style={styles.amountDisplayContainer}>
                  <Text style={styles.amountDisplay}>
                    {isAmountVisible
                      ? formatAmount(amount)
                      : amount.replace(/./g, "•")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsAmountVisible((v) => !v)}
                    style={styles.visibilityButton}
                    activeOpacity={0.7}
                    disabled={isProcessing}
                  >
                    <Ionicons
                      name={isAmountVisible ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#B3C5D7"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.quickAmountSection}>
                <Text style={styles.quickAmountLabel}>Quick Amounts</Text>
                <View style={styles.quickAmountContainer}>
                  {QUICK_AMOUNTS.map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.quickAmountButton,
                        amount === val.toString() &&
                          styles.quickAmountButtonActive,
                      ]}
                      onPress={() => setQuickAmount(val)}
                      activeOpacity={0.7}
                      disabled={isProcessing}
                    >
                      <Text
                        style={[
                          styles.quickAmountText,
                          amount === val.toString() &&
                            styles.quickAmountTextActive,
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Keyboard Section */}
            <View style={styles.keyboardSection}>
              <View style={styles.keyboard}>
                {KEYS.map((row, i) => (
                  <View key={i} style={styles.keyboardRow}>
                    {row.map((k) => (
                      <TouchableOpacity
                        key={k}
                        style={[
                          styles.key,
                          k === "<" ? styles.keySpecial : styles.keyNormal,
                        ]}
                        onPress={() => onKeyPress(k)}
                        activeOpacity={0.7}
                        disabled={isProcessing}
                      >
                        {k === "<" ? (
                          <Ionicons
                            name="backspace-outline"
                            size={22}
                            color="#ffffff"
                          />
                        ) : (
                          <Text style={styles.keyText}>{k}</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>

              <View style={styles.noteSection}>
                <Text style={styles.noteLabel}>Add a note (optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Enter a remarks..."
                  multiline
                  maxLength={100}
                  placeholderTextColor="#8E8E93"
                  value={purpose}
                  onChangeText={setPurpose}
                  editable={!isProcessing}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>{purpose.length}/100</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!isAmountValid || !username.trim() || isProcessing) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!isAmountValid || !username.trim() || isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons
                      name="hourglass-outline"
                      size={20}
                      color="#ffffff"
                    />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons
                      name="arrow-up-circle-outline"
                      size={20}
                      color="#ffffff"
                    />
                    <Text style={styles.sendButtonText}>
                      Send{amount ? ` ${formatAmount(amount)}` : ""}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* <View style={styles.securityNotice}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color="#8E8E93"
                />
                <Text style={styles.securityText}>
                  Your transaction is secured with bank-level encryption
                </Text>
              </View> */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? 20 : 20,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    paddingLeft: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  headerSubtext: {
    fontSize: 14,
    color: "#B3C5D7",
    marginTop: 4,
  },
  usernameSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  usernameInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  purposeInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 3,
    fontSize: 16,
    color: "#333",
  },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  animatedContainer: { paddingHorizontal: 20 },
  amountSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "600",
    color: "#B3C5D7",
    marginRight: 8,
  },
  amountDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  amountDisplay: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
    textAlign: "left",
  },
  visibilityButton: {
    padding: 8,
    marginLeft: 12,
  },
  quickAmountSection: {
    marginBottom: 30,
  },
  quickAmountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B3C5D7",
    marginBottom: 12,
    textAlign: "center",
  },
  quickAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  quickAmountButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "#ffffff",
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B3C5D7",
  },
  quickAmountTextActive: {
    color: "#ffffff",
  },
  keyboardSection: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    flex: 1,
  },
  keyboard: {
    marginBottom: 24,
  },
  keyboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  key: {
    flex: 1,
    height: 56,
    marginHorizontal: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  keyNormal: {
    backgroundColor: "#F8F9FA",
  },
  keySpecial: {
    backgroundColor: "#E3F2FD",
  },
  keyText: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.primary,
  },
  noteSection: {
    marginBottom: 24,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
    color: "#1C1C1E",
    fontSize: 16,
    minHeight: 80,
    maxHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "right",
    marginTop: 4,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#B0BEC5",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  securityText: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 6,
    textAlign: "center",
  },
});

export default SendMoney;
