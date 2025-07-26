import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors'; // your custom colors if any

export default function Loader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary || "#007AFF"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // or 'transparent' if overlay
  },
});
