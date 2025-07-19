import React, { useState, useRef } from 'react'; 
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Otp = () => {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const inputRef = useRef<TextInput>(null);

  const isOtpValid = otp.length === 6;

  const handleChangeText = (text: string) => {
    if (text.length <= 6) {
      setOtp(text);
    }
  };

  const handleVerify = () => {
    if (!isOtpValid) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP code.');
      return;
    }
    router.replace('/changePassword');  // <-- Navigate here on verify
  };

  const handleResend = () => {
    Alert.alert('Resend OTP', 'OTP resend request sent!');
  };

  const handleBack = () => {
    router.back();
  };

  const handleOtpBoxPress = () => {
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Enter OTP</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Please enter the 6-digit code sent to your phone</Text>

        <TouchableOpacity activeOpacity={1} onPress={handleOtpBoxPress}>
          <View style={styles.otpInputContainer}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.otpBox}>
                <Text style={styles.otpText}>{otp[i] || ''}</Text>
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
        />

        <TouchableOpacity
          style={[styles.button, !isOtpValid && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={!isOtpValid}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          style={[styles.button, styles.secondaryButton]}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Resend OTP</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Otp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 30,
    marginTop: 10,
    textAlign: 'center',
    width: '80%',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  otpBox: {
    width: 40,
    height: 50,
    borderWidth: 2,
    borderColor: '#aaa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  otpText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  button: {
    width: '80%',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonDisabled: {
    backgroundColor: '#888',
  },
  secondaryButton: {
    backgroundColor: Colors.primaryLight,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
