import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { LinearGradient } from "expo-linear-gradient";

const AboutSettings = () => {
  const router = useRouter();
   useEffect(() => {
        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            router.replace('/(tabs)/settings');
            return true;
          }
        );
    
        return () => backHandler.remove();
      }, [router]);

  const appVersion = '2.1.0';
  const buildNumber = '241';
  const releaseDate = 'January 2025';

  const handleLinkPress = (url: string, title: string) => {
    Alert.alert(
      title,
      `Would you like to open ${title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: () => Linking.openURL(url),
        },
      ]
    );
  };

  const handleFeedback = () => {
    Alert.alert(
      'Send Feedback',
      'Choose how you would like to send feedback:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@surakshyapay.com?subject=App Feedback'),
        },
        {
          text: 'In-App',
          onPress: () => {
            Alert.alert('Feedback', 'Feedback form would open here.');
          },
        },
      ]
    );
  };

  const aboutSections = [
    {
      title: 'About SurakshyaPay',
      items: [
        {
          icon: 'shield-checkmark',
          title: 'Zero-Knowledge Privacy',
          description: 'SurakshyaPay uses advanced Zero-Knowledge Proofs (ZKPs) to ensure your transactions remain completely private while maintaining full security and compliance.',
          color: '#4CAF50',
        },
        {
          icon: 'lock-closed',
          title: 'Advanced Security',
          description: 'Our cryptographic protocols ensure that your financial data is protected with military-grade encryption and privacy-preserving technology.',
          color: '#2196F3',
        },
        {
          icon: 'flash',
          title: 'Instant Transactions',
          description: 'Experience lightning-fast payments with zero-knowledge verification, enabling instant settlements without compromising privacy.',
          color: '#FF9800',
        },
      ],
    },
    {
      title: 'Technology',
      items: [
        {
          icon: 'code-slash',
          title: 'ZK-SNARKs Technology',
          description: 'Powered by Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge for maximum privacy and efficiency.',
        },
        {
          icon: 'layers',
          title: 'Blockchain Integration',
          description: 'Built on secure blockchain infrastructure with Layer 2 scaling solutions for optimal performance.',
        },
        {
          icon: 'analytics',
          title: 'Privacy by Design',
          description: 'Every feature is built with privacy-first principles, ensuring your data remains yours.',
        },
      ],
    },
    {
      title: 'Help & Support',
      items: [
        {
          icon: 'help-circle',
          title: 'FAQ',
          description: 'Find answers to commonly asked questions about ZKPs and SurakshyaPay features.',
          action: () => handleLinkPress('https://surakshyapay.com/faq', 'FAQ'),
        },
        {
          icon: 'chatbubbles',
          title: 'Live Chat Support',
          description: '24/7 customer support with our expert team.',
          action: () => Alert.alert('Live Chat', 'Live chat feature would open here.'),
        },
        {
          icon: 'mail',
          title: 'Contact Us',
          description: 'Get in touch with our support team via email.',
          action: () => Linking.openURL('mailto:support@surakshyapay.com'),
        },
        {
          icon: 'star',
          title: 'Send Feedback',
          description: 'Help us improve SurakshyaPay with your valuable feedback.',
          action: handleFeedback,
        },
      ],
    },
    {
      title: 'Legal & Privacy',
      items: [
        {
          icon: 'document-text',
          title: 'Terms of Service',
          description: 'Read our terms and conditions for using SurakshyaPay.',
          action: () => handleLinkPress('https://surakshyapay.com/terms', 'Terms of Service'),
        },
        {
          icon: 'shield',
          title: 'Privacy Policy',
          description: 'Learn how we protect and handle your personal information.',
          action: () => handleLinkPress('https://surakshyapay.com/privacy', 'Privacy Policy'),
        },
        {
          icon: 'newspaper',
          title: 'Open Source Licenses',
          description: 'View licenses for open source components used in our app.',
          action: () => handleLinkPress('https://surakshyapay.com/licenses', 'Open Source Licenses'),
        },
      ],
    },
  ];

  const renderSection = (section: typeof aboutSections[0], index: number) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item, itemIndex) => (
          <TouchableOpacity
            key={item.title}
            style={[
              styles.item,
              itemIndex === section.items.length - 1 && styles.itemLast,
            ]}
            onPress={item.action}
            activeOpacity={item.action ? 0.7 : 1}
            disabled={!item.action}
          >
            <View style={styles.itemContent}>
              <View style={[
                styles.iconContainer,
                item.color && { backgroundColor: `${item.color}15` }
              ]}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.color || Colors.primary}
                />
              </View>
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.action && (
                    <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                  )}
                </View>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
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
            onPress={() => router.push('/(tabs)/settings')}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>About SurakshyaPay</Text>
            <Text style={styles.headerSubtext}>Privacy-first digital payments</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* App Info Card */}
          <View style={styles.appInfoCard}>
            <View style={styles.appLogo}>
              <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>SurakshyaPay</Text>
            <Text style={styles.appTagline}>Secure. Private. Instant.</Text>
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>Version {appVersion} (Build {buildNumber})</Text>
              <Text style={styles.releaseText}>Released {releaseDate}</Text>
            </View>
          </View>

          {/* Sections */}
          {aboutSections.map((section, index) => renderSection(section, index))}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made with ❤️ for privacy-conscious users
            </Text>
            <Text style={styles.copyrightText}>
              © 2025 SurakshyaPay. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default AboutSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor:"rgba(255, 255, 255, 0.1)"
  },
  headerContent: {
    flex: 1,
    paddingLeft: 10,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  appInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center',
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  releaseText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
  },
});