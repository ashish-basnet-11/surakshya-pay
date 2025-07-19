import React, { useState, useLayoutEffect } from 'react';
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

  const handleTopUp = async () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid top-up amount.');
      return;
    }
    try {
      setProofResult(null);
      setIsProofGenerating(true);
      await new Promise((res) => setTimeout(res, 2000));
      setIsProofGenerating(false);
      setIsVerifying(true);
      await new Promise((res) => setTimeout(res, 2000));
      setIsVerifying(false);
      setProofResult('success');
      setProofId('ZKP123456789');
      setAmount('');
    } catch {
      setProofResult('failure');
      Alert.alert('Error', 'Proof verification failed. Please try again.');
    }
  };

  const onKeyPress = (key: string) => {
    if (key === '<') {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!amount.includes('.')) setAmount((prev) => prev + key);
      return;
    }
    if (amount.length < 7) setAmount((prev) => prev + key);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/')}
          disabled={isProofGenerating || isVerifying}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={isProofGenerating || isVerifying ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Load</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <View style={styles.amountBox}>
          <Text style={styles.label}>Enter load Amount</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.amountText}>
              {isAmountVisible ? amount || '0' : amount.replace(/./g, '•')}
            </Text>
            <TouchableOpacity
              onPress={() => setIsAmountVisible((prev) => !prev)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={isAmountVisible ? 'eye-outline' : 'eye-off'}
                size={22}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.keyboard}>
            {KEYS.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keyboardRow}>
                {row.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.key, key === '<' ? styles.keyBackspace : null]}
                    onPress={() => onKeyPress(key)}
                    activeOpacity={0.7}
                    disabled={isProofGenerating || isVerifying}
                  >
                    {key === '<' ? (
                      <Ionicons name="backspace" size={24} color="#fff" />
                    ) : (
                      <Text style={styles.keyText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (isProofGenerating || isVerifying) && { backgroundColor: '#a0c4ff' },
            ]}
            onPress={handleTopUp}
            activeOpacity={0.8}
            disabled={isProofGenerating || isVerifying || amount.length === 0}
          >
            {isProofGenerating || isVerifying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Load</Text>
            )}
          </TouchableOpacity>

          {proofResult === 'success' && proofId && (
            <View style={styles.proofInfo}>
              <Text style={styles.successText}>✅ load verified successfully!</Text>
              <Text style={styles.proofIdText}>Proof ID: {proofId}</Text>
            </View>
          )}
          {proofResult === 'failure' && (
            <Text style={styles.errorText}>
              ❌ Proof verification failed. Please try again.
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TopUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  amountBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a0b9ff',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    height: 48,
  },
  amountText: {
    flex: 1,
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  eyeIcon: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 25,
    marginBottom: 100,
  },
  keyboard: {
    marginBottom: 20,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  key: {
    flex: 1,
    marginHorizontal: 6,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyBackspace: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proofInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: 12,
  },
  successText: {
    color: '#adffb4',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  proofIdText: {
    color: '#adffb4',
    fontSize: 14,
    fontStyle: 'italic',
  },
  errorText: {
    marginTop: 20,
    color: '#ffdddd',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 15,
    borderRadius: 12,
    fontWeight: '600',
    fontSize: 15,
  },
});
