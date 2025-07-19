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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
        <Text style={styles.headerText}>Top Up</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <View style={styles.amountBox}>
          <Text style={styles.label}>Enter Top-Up Amount</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.amountText}>
              {isAmountVisible ? amount || '0' : amount.replace(/./g, '•')}
            </Text>
            <TouchableOpacity
              onPress={() => setIsAmountVisible((prev) => !prev)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={isAmountVisible ? 'eye' : 'eye-off'}
                size={22}
                color="#444"
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
                      <Ionicons name="backspace" size={24} color="#444" />
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
            {(isProofGenerating || isVerifying) ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="payment" size={24} color="#fff" />
                <Text style={styles.buttonText}>Top Up Now</Text>
              </>
            )}
          </TouchableOpacity>

          {proofResult === 'success' && proofId && (
            <View style={styles.proofInfo}>
              <Text style={styles.successText}>✅ Top-up verified successfully!</Text>
              <Text style={styles.proofIdText}>Proof ID: {proofId}</Text>
            </View>
          )}
          {proofResult === 'failure' && (
            <Text style={styles.errorText}>❌ Proof verification failed. Please try again.</Text>
          )}

          <Text style={styles.note}>
            Your top-up will be verified securely using Zero-Knowledge Proof technology.
          </Text>
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
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a0b9ff',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fafafa',
    height: 48,
  },
  amountText: {
    flex: 1,
    fontSize: 24,
    color: '#333',
    fontWeight: '600',
  },
  eyeIcon: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 25,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
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
    backgroundColor: '#e6e6e6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyBackspace: {
    backgroundColor: '#ccc',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#444',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  proofInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#d4edda',
    borderRadius: 12,
  },
  successText: {
    color: '#155724',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  proofIdText: {
    color: '#155724',
    fontSize: 14,
    fontStyle: 'italic',
  },
  errorText: {
    marginTop: 20,
    color: '#721c24',
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 12,
    fontWeight: '600',
    fontSize: 15,
  },
  note: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
