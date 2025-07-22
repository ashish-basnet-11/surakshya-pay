import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  BackHandler,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from '@react-navigation/native';

type PersonalInfo = {
  firstName: string;
  lastName: string;
  dob: string;
  phoneNumber: string;
  address: string;
};

type DocumentInfo = {
  type: string;
  file: DocumentPicker.DocumentResult | null;
};

type KycStep = 'personal' | 'document' | 'preview';

const VerifyKyc = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState<KycStep>('personal');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
    address: '',
  });
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>({
    type: '',
    file: null,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (currentStep === 'personal') {
          router.replace('/(tabs)/settings');
        } else {
          goToPreviousStep();
        }
        return true;
      }
    );
    return () => backHandler.remove();
  }, [currentStep]);

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) parent.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      if (parent) parent.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setDocumentInfo(prev => ({ ...prev, file: result.assets[0] }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const validatePersonalInfo = (): boolean => {
    if (!personalInfo.firstName.trim() || !personalInfo.lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first and last name');
      return false;
    }
    if (!personalInfo.dob) {
      Alert.alert('Validation Error', 'Please enter your date of birth');
      return false;
    }
    if (!personalInfo.phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return false;
    }
    return true;
  };

  const validateDocumentInfo = (): boolean => {
    if (!documentInfo.type) {
      Alert.alert('Validation Error', 'Please select a document type');
      return false;
    }
    if (!documentInfo.file) {
      Alert.alert('Validation Error', 'Please upload a document');
      return false;
    }
    return true;
  };

  const goToNextStep = () => {
    if (currentStep === 'personal' && !validatePersonalInfo()) return;
    if (currentStep === 'document' && !validateDocumentInfo()) return;

    if (currentStep === 'personal') setCurrentStep('document');
    else if (currentStep === 'document') setCurrentStep('preview');
  };

  const goToPreviousStep = () => {
    if (currentStep === 'document') setCurrentStep('personal');
    else if (currentStep === 'preview') setCurrentStep('document');
  };

  const handleSubmit = () => {
    setShowSuccess(true);
  };

  const steps = [
    { id: 'personal', title: 'Personal Information' },
    { id: 'document', title: 'Document Upload' },
    { id: 'preview', title: 'Review & Submit' },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => currentStep === 'personal' 
              ? router.push('/(tabs)/settings') 
              : goToPreviousStep()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Your KYC</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Secure Account Banner */}
          <View style={styles.bannerCard}>
            <Ionicons name="shield-checkmark" size={32} color={Colors.success} />
            <Text style={styles.bannerTitle}>Secure your account</Text>
            <Text style={styles.bannerText}>
              Complete the steps below to verify your identity and unlock full
              features.
            </Text>
          </View>

          {/* Step Progress */}
          <View style={styles.stepIndicatorContainer}>
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <View style={styles.stepIndicatorItem}>
                  <View
                    style={[
                      styles.stepIndicatorCircle,
                      currentStep === step.id && styles.activeStep,
                      (currentStep === 'preview' && step.id === 'document') && styles.completedStep,
                      (currentStep === 'document' && step.id === 'personal') && styles.completedStep,
                    ]}
                  >
                    {((currentStep === 'preview' && step.id !== 'preview') || 
                      (currentStep === 'document' && step.id === 'personal')) ? (
                      <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
                    ) : (
                      <Text style={styles.stepIndicatorText}>{index + 1}</Text>
                    )}
                  </View>
                  <Text style={styles.stepIndicatorTitle}>{step.title}</Text>
                </View>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.stepIndicatorLine,
                    (currentStep === 'document' && step.id === 'personal') && styles.completedLine,
                    (currentStep === 'preview') && styles.completedLine,
                  ]} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Step Content */}
          {currentStep === 'personal' && (
            <View style={styles.stepContent}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <Text style={styles.sectionSubtitle}>Please provide your personal details</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={personalInfo.firstName}
                  onChangeText={(text) => handlePersonalInfoChange('firstName', text)}
                  placeholder="Enter your first name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={personalInfo.lastName}
                  onChangeText={(text) => handlePersonalInfoChange('lastName', text)}
                  placeholder="Enter your last name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  value={personalInfo.dob}
                  onChangeText={(text) => handlePersonalInfoChange('dob', text)}
                  placeholder="DD/MM/YYYY"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={personalInfo.phoneNumber}
                  onChangeText={(text) => handlePersonalInfoChange('phoneNumber', text)}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={personalInfo.address}
                  onChangeText={(text) => handlePersonalInfoChange('address', text)}
                  placeholder="Enter your full address"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          )}

          {currentStep === 'document' && (
            <View style={styles.stepContent}>
              <Text style={styles.sectionTitle}>Document Verification</Text>
              <Text style={styles.sectionSubtitle}>Upload a government-issued ID</Text>

              <View style={styles.dropdownWrapper}>
                <Text style={styles.label}>Document Type</Text>
                <View style={styles.dropdownContainer}>
                  <Picker
                    selectedValue={documentInfo.type}
                    onValueChange={(value) => setDocumentInfo(prev => ({ ...prev, type: value }))}
                    style={styles.picker}
                    dropdownIconColor={Colors.textPrimary}
                  >
                    <Picker.Item
                      label="-- Select Document Type --"
                      value=""
                      color={Colors.textSecondary}
                    />
                    <Picker.Item
                      label="Passport"
                      value="passport"
                      color={Colors.textPrimary}
                    />
                    <Picker.Item
                      label="National ID"
                      value="national_id"
                      color={Colors.textPrimary}
                    />
                    <Picker.Item
                      label="Driver's License"
                      value="drivers_license"
                      color={Colors.textPrimary}
                    />
                  </Picker>
                </View>
              </View>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleDocumentPick}
              >
                <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
                <Text style={styles.uploadButtonText}>
                  {documentInfo.file ? 'Change Document' : 'Upload Document'}
                </Text>
              </TouchableOpacity>

              {documentInfo.file && (
                <View style={styles.uploadPreview}>
                  <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                  <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                    {documentInfo.file.name}
                  </Text>
                  <TouchableOpacity onPress={() => setDocumentInfo(prev => ({ ...prev, file: null }))}>
                    <Ionicons name="close-circle" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {currentStep === 'preview' && (
            <View style={styles.stepContent}>
              <Text style={styles.sectionTitle}>Review Your Information</Text>
              <Text style={styles.sectionSubtitle}>Please verify all details before submission</Text>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Personal Information</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Full Name:</Text>
                  <Text style={styles.reviewValue}>
                    {personalInfo.firstName} {personalInfo.lastName}
                  </Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Date of Birth:</Text>
                  <Text style={styles.reviewValue}>{personalInfo.dob}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Phone Number:</Text>
                  <Text style={styles.reviewValue}>{personalInfo.phoneNumber}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Address:</Text>
                  <Text style={styles.reviewValue}>{personalInfo.address}</Text>
                </View>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Document Information</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Document Type:</Text>
                  <Text style={styles.reviewValue}>
                    {documentInfo.type === 'passport' && 'Passport'}
                    {documentInfo.type === 'national_id' && 'National ID'}
                    {documentInfo.type === 'drivers_license' && "Driver's License"}
                  </Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Document File:</Text>
                  <Text style={styles.reviewValue} numberOfLines={1} ellipsizeMode="middle">
                    {documentInfo.file?.name}
                  </Text>
                </View>
              </View>

              {/* Success Modal */}
              {showSuccess && (
                <View style={styles.successCard}>
                  <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
                  <Text style={styles.successTitle}>Verification Submitted</Text>
                  <Text style={styles.successText}>
                    Your KYC information has been received and is under review.
                    We'll notify you once the verification is complete.
                  </Text>
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => router.replace('/(tabs)/settings')}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          {currentStep === 'preview' && !showSuccess && (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleSubmit}
            >
              <Text style={styles.verifyButtonText}>Confirm</Text>
            </TouchableOpacity>
          )}

          {currentStep !== 'preview' && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={goToNextStep}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
    backgroundColor: Colors.primary,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 25,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textInverse,
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  bannerCard: {
    backgroundColor: Colors.primary + "15",
    borderColor: Colors.primary + "40",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 8,
  },
  bannerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepIndicatorItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicatorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.neutral200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral300,
  },
  activeStep: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  completedStep: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepIndicatorText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  stepIndicatorTitle: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepIndicatorLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.neutral300,
    marginHorizontal: 4,
  },
  completedLine: {
    backgroundColor: Colors.success,
  },
  stepContent: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownWrapper: {
    marginBottom: 20,
  },
  dropdownContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  picker: {
    height: 50,
    width: '100%',
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundSecondary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  uploadButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  uploadPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.neutral100,
    padding: 12,
    borderRadius: 8,
    borderColor: Colors.borderLight,
    borderWidth: 1,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  reviewSection: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  reviewValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
    marginTop: 24,
    elevation: 4,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.success,
    marginTop: 12,
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  doneButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerifyKyc;