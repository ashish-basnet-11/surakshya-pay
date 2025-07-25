import React, { useState, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  Animated,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Colors from '@/constants/Colors';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '<'],
];

const QUICK_AMOUNTS = [10, 50, 100, 200];

const TopUp = () => {
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) parent.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      if (parent) parent.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  const [amount, setAmount] = useState('');
  const [isAmountVisible, setIsAmountVisible] = useState(true);
  const [isProofGenerating, setIsProofGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [proofResult, setProofResult] = useState<'success' | 'failure' | null>(null);
  const [proofId, setProofId] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(1));

   useFocusEffect(
           useCallback(() => {
             const onBackPress = () => {
               router.replace('/(tabs)'); 
               return true;
             };
         
             const backHandler = BackHandler.addEventListener(
               'hardwareBackPress',
               onBackPress
             );
         
             return () => backHandler.remove();
           }, [])
         );

  const handleTopUp = async () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid top-up amount.');
      return;
    }

    if (numAmount < 1) {
      Alert.alert('Minimum Amount', 'Minimum top-up amount is NPR 1.');
      return;
    }

    if (numAmount > 5000) {
      Alert.alert('Maximum Amount', 'Maximum top-up amount is NPR 5,000.');
      return;
    }

    try {
      setProofResult(null);
      setIsProofGenerating(true);
      
      Animated.timing(fadeAnim, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: true,
      }).start();

      await new Promise((res) => setTimeout(res, 2000));
      setIsProofGenerating(false);
      setIsVerifying(true);
      await new Promise((res) => setTimeout(res, 2000));
      setIsVerifying(false);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setProofResult('success');
      setProofId(`ZKP${Date.now()}`);
      setAmount('');
    } catch {
      setProofResult('failure');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Alert.alert('Error', 'Proof verification failed. Please try again.');
    }
  };

  const onKeyPress = (key: string) => {
    if (key === '<') {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!amount.includes('.') && amount.length > 0) {
        setAmount((prev) => prev + key);
      }
      return;
    }
    if (amount.length < 8) {
      setAmount((prev) => prev + key);
    }
  };

  const setQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const formatAmount = (value: string) => {
    if (!value) return '0';
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toLocaleString('en-US');
  };

  const getProcessingText = () => {
    if (isProofGenerating) return 'Generating Proof...';
    if (isVerifying) return 'Verifying Transaction...';
    return 'Add Money';
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            disabled={isProofGenerating || isVerifying}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isProofGenerating || isVerifying ? '#B3C5D7' : '#ffffff'}
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Add Money</Text>
            <Text style={styles.headerSubtext}>Load money to your wallet</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}
        >
          <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
            {/* Amount Display */}
            <View style={styles.amountSection}>
              <Text style={styles.currencySymbol}>NPR</Text>
              <View style={styles.amountDisplayContainer}>
                <Text style={styles.amountDisplay}>
                  {isAmountVisible ? formatAmount(amount) : amount.replace(/./g, '•')}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsAmountVisible((prev) => !prev)}
                  style={styles.visibilityButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isAmountVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#B3C5D7"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountSection}>
              <Text style={styles.quickAmountLabel}>Quick Add</Text>
              <View style={styles.quickAmountContainer}>
                {QUICK_AMOUNTS.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[
                      styles.quickAmountButton,
                      amount === quickAmount.toString() && styles.quickAmountButtonActive,
                    ]}
                    onPress={() => setQuickAmount(quickAmount)}
                    activeOpacity={0.7}
                    disabled={isProofGenerating || isVerifying}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        amount === quickAmount.toString() && styles.quickAmountTextActive,
                      ]}
                    >
                    {quickAmount.toLocaleString('en-US')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Custom Keyboard */}
          <View style={styles.keyboardSection}>
            <View style={styles.keyboard}>
              {KEYS.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.keyboardRow}>
                  {row.map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.key,
                        key === '<' ? styles.keySpecial : styles.keyNormal,
                      ]}
                      onPress={() => onKeyPress(key)}
                      activeOpacity={0.7}
                      disabled={isProofGenerating || isVerifying}
                    >
                      {key === '<' ? (
                        <Ionicons name="backspace-outline" size={22} color="#ffffff" />
                      ) : (
                        <Text style={styles.keyText}>{key}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                (isProofGenerating || isVerifying || !amount) && styles.actionButtonDisabled,
              ]}
              onPress={handleTopUp}
              activeOpacity={0.8}
              disabled={isProofGenerating || isVerifying || !amount}
            >
              {isProofGenerating || isVerifying ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loadingText}>{getProcessingText()}</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Add Money</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Success/Error Messages */}
            {proofResult === 'success' && proofId && (
              <View style={styles.successContainer}>
                <View style={styles.successHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.successTitle}>Transaction Successful!</Text>
                </View>
                <Text style={styles.proofIdText}>Transaction ID: {proofId}</Text>
              </View>
            )}

            {proofResult === 'failure' && (
              <View style={styles.errorContainer}>
                <View style={styles.errorHeader}>
                  <Ionicons name="close-circle" size={24} color="#FF5722" />
                  <Text style={styles.errorTitle}>Transaction Failed</Text>
                </View>
                <Text style={styles.errorDescription}>
                  Please check your connection and try again.
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default TopUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 50 : 40, 
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    paddingLeft:10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  headerSubtext: {
    fontSize: 14,
    color: '#B3C5D7',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  animatedContainer: {
    flex: 1,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: '#B3C5D7',
    marginRight: 8,
  },
  amountDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  amountDisplay: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'left',
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
    fontWeight: '600',
    color: '#B3C5D7',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickAmountButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#ffffff',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B3C5D7',
  },
  quickAmountTextActive: {
    color: '#ffffff',
  },
  keyboardSection: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginHorizontal: -20,
  },
  keyboard: {
    marginBottom: 24,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  key: {
    flex: 1,
    height: 56,
    marginHorizontal: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyNormal: {
    backgroundColor: '#F8F9FA',
  },
  keySpecial: {
    backgroundColor: '#E3F2FD',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  successContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginLeft: 8,
  },
  proofIdText: {
    fontSize: 14,
    color: '#388E3C',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
    marginLeft: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#D32F2F',
  },
});
