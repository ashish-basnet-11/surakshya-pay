import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'; 
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from 'expo-router';

const TransactionSettings = () => {
  const router = useRouter();

  const [limitAlerts, setLimitAlerts] = useState(true);
  const [autoCategorize, setAutoCategorize] = useState(false);
  const [transactionNotifications, setTransactionNotifications] = useState(true);

    useFocusEffect(
        useCallback(() => {
          const onBackPress = () => {
            router.replace('/(tabs)/settings'); 
            return true;
          };
      
          const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
          );
      
          return () => backHandler.remove();
        }, [])
      );

  const transactionOptions = [
    {
      id: 'notifications',
      title: 'Transaction Notifications',
      description: 'Get instant alerts for all account transactions',
      icon: 'notifications',
      iconSet: 'Ionicons',
      color: '#007AFF',
      value: transactionNotifications,
      onToggle: setTransactionNotifications,
    },
    {
      id: 'spending',
      title: 'Spending Limit Alerts',
      description: 'Receive warnings when approaching spending limits',
      icon: 'trending-up',
      iconSet: 'Ionicons',
      color: '#FF3B30',
      value: limitAlerts,
      onToggle: setLimitAlerts,
    },
    {
      id: 'categorize',
      title: 'Auto Categorize Transactions',
      description: 'Automatically organize transactions into categories',
      icon: 'tag',
      iconSet: 'Feather',
      color: '#34C759',
      value: autoCategorize,
      onToggle: setAutoCategorize,
    },
  ];

  const renderIcon = (iconSet, iconName, size, color) => {
    switch (iconSet) {
      case 'Ionicons':
        return <Ionicons name={iconName} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={size} color={color} />;
      case 'Feather':
        return <Feather name={iconName} size={size} color={color} />;
      default:
        return <Ionicons name={iconName} size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
          colors={[
            Colors.primary,
            Colors.primaryLight,
            Colors.backgroundSecondary,
          ]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/settings')} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction Preferences</Text>
          <Text style={styles.sectionSubtitle}>
            Customize how you track and monitor your financial activity
          </Text>
        </View>

        {/* Transaction Options */}
        <View style={styles.optionsContainer}>
          {transactionOptions.map((option, index) => (
            <View 
              key={option.id} 
              style={[
                styles.optionItem,
                index === transactionOptions.length - 1 && styles.lastItem
              ]}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                  {renderIcon(option.iconSet, option.icon, 22, '#FFFFFF')}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
              <Switch
                value={option.value}
                onValueChange={option.onToggle}
                trackColor={{ 
                  false: '#E5E5EA', 
                  true: option.color + '40' 
                }}
                thumbColor={option.value ? option.color : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
                style={styles.switch}
              />
            </View>
          ))}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#5856D6' }]}>
                <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Spending Limits</Text>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionItem, styles.lastQuickAction]} 
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#AF52DE' }]}>
                <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Transaction History</Text>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.infoTitle}>Smart Categorization</Text>
            </View>
            <Text style={styles.infoText}>
              When enabled, transactions are automatically sorted into categories like 
              dining, shopping, and utilities using machine learning for better expense tracking.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TransactionSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
   backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
    borderRadius: 25,
    backgroundColor:"rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
    paddingLeft: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  optionsContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  optionDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  switch: {
    transform: Platform.OS === 'ios' ? [] : [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  quickActionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  lastQuickAction: {
    borderBottomWidth: 0,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    letterSpacing: -0.1,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#6D6D70',
    lineHeight: 22,
  },
});