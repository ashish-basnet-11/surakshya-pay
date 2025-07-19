import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';  // Add icon

type CustomAlertProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, message, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.secondary} style={styles.icon} />
          <Text style={styles.message}>{message}</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.buttonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
  },
  icon: {
    marginBottom: 15,
  },
  message: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
  },
  button: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
