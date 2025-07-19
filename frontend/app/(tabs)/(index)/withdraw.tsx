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

  const numAmount = Number(amount);
  const isAmountValid = amount !== '' && !isNaN(numAmount) && numAmount > 0;

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

  const handleWithdraw = () => {
    if (!isAmountValid) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    Alert.alert('Success', `You have withdrawn ₹${amount}${note ? ` with note: ${note}` : ''}`);
    setAmount('');
    setNote('');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Withdraw</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.amountBox}>
            <Text style={styles.label}>Enter Withdraw Amount</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.amountText}>
                {isAmountVisible ? amount || '0' : amount.replace(/./g, '•')}
              </Text>
              <TouchableOpacity
                onPress={() => setIsAmountVisible((prev) => !prev)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isAmountVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="rgba(255, 255, 255, 0.8)"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.keyboardCard}>
            <View style={styles.keyboard}>
              {KEYS.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.keyboardRow}>
                  {row.map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.key, key === '<' ? styles.keyBackspace : null]}
                      onPress={() => onKeyPress(key)}
                      activeOpacity={0.7}
                    >
                      {key === '<' ? (
                        <Ionicons name="backspace-outline" size={24} color="#fff" />
                      ) : (
                        <Text style={styles.keyText}>{key}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.noteInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Add a note"
              multiline
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={note}
              onChangeText={setNote}
              cursorColor="#fff"
              selectionColor="#a0b9ff"
            />

            <TouchableOpacity
              style={[styles.button, !isAmountValid && { backgroundColor: '#555' }]}
              onPress={handleWithdraw}
              disabled={!isAmountValid}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a0b9ff',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
  keyboardCard: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyBackspace: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#a0b9ff',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Withdraw;