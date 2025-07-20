import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
  BackHandler,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import Colors from '@/constants/Colors';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '<'],
];

const QUICK_AMOUNTS = [10, 50, 100, 250];

const Withdraw = () => {
  const router = useRouter();
  const navigation = useNavigation();

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        router.replace('/(tabs)');
        return true;
      }
    );

    return () => backHandler.remove();
  }, [router]);

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) parent.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      if (parent) parent.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isAmountVisible, setIsAmountVisible] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const numAmount = Number(amount);
  const isAmountValid = amount !== '' && !isNaN(numAmount) && numAmount > 0;

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

  const handleWithdraw = async () => {
    if (!isAmountValid) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }

    if (numAmount < 1) {
      Alert.alert('Minimum Amount', 'Minimum withdrawal amount is $1.');
      return;
    }

    if (numAmount > 2500) {
      Alert.alert('Maximum Amount', 'Maximum withdrawal amount is $2,500 per transaction.');
      return;
    }

    // Simulate processing
    setIsProcessing(true);
    Animated.timing(fadeAnim, {
      toValue: 0.6,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Withdrawal Successful',
        `${formatAmount(amount)} has been withdrawn successfully.${note ? `\n\nNote: ${note}` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setNote('');
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Withdrawal failed. Please try again.');
    } finally {
      setIsProcessing(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.replace('/(tabs)')} 
            style={styles.backButton}
            activeOpacity={0.7}
            disabled={isProcessing}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isProcessing ? '#B3C5D7' : '#ffffff'} 
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Withdraw Money</Text>
            <Text style={styles.headerSubtext}>Transfer money from your wallet</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
              {/* Amount Display */}
              <View style={styles.amountSection}>
                <Text style={styles.currencySymbol}>$</Text>
                <View style={styles.amountDisplayContainer}>
                  <Text style={styles.amountDisplay}>
                    {isAmountVisible ? formatAmount(amount) : amount.replace(/./g, '•')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsAmountVisible((prev) => !prev)}
                    style={styles.visibilityButton}
                    activeOpacity={0.7}
                    disabled={isProcessing}
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
                <Text style={styles.quickAmountLabel}>Quick Withdraw</Text>
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
                      disabled={isProcessing}
                    >
                      <Text
                        style={[
                          styles.quickAmountText,
                          amount === quickAmount.toString() && styles.quickAmountTextActive,
                        ]}
                      >
                        ${quickAmount.toLocaleString('en-US')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Keyboard and Controls Section */}
            <View style={styles.keyboardSection}>
              {/* Custom Keyboard */}
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
                        disabled={isProcessing}
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

              {/* Note Input */}
              <View style={styles.noteSection}>
                <Text style={styles.noteLabel}>Add a note (optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Enter withdrawal purpose or note..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#8E8E93"
                  value={note}
                  onChangeText={setNote}
                  maxLength={100}
                  editable={!isProcessing}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>{note.length}/100</Text>
              </View>

              {/* Withdraw Button */}
              <TouchableOpacity
                style={[
                  styles.withdrawButton,
                  (!isAmountValid || isProcessing) && styles.withdrawButtonDisabled,
                ]}
                onPress={handleWithdraw}
                disabled={!isAmountValid || isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="hourglass-outline" size={20} color="#ffffff" />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="arrow-up-circle-outline" size={20} color="#ffffff" />
                    <Text style={styles.withdrawButtonText}>
                      Withdraw{amount ? ` ${formatAmount(amount)}` : ''}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Security Notice */}
              <View style={styles.securityNotice}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#8E8E93" />
                <Text style={styles.securityText}>
                  Your transaction is secured with bank-level encryption
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSubtext: {
    fontSize: 14,
    color: '#B3C5D7',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  animatedContainer: {
    paddingHorizontal: 20,
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
    flex: 1,
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
  noteSection: {
    marginBottom: 24,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    color: '#1C1C1E',
    fontSize: 16,
    minHeight: 80,
    maxHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  withdrawButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  withdrawButtonDisabled: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  withdrawButtonText: {
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
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 6,
    textAlign: 'center',
  },
});

export default Withdraw;