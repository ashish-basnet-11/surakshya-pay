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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from 'expo-router';
import { useMutation, useQuery } from "@tanstack/react-query";
import { submitKYC, checkKYCStatus, KYCCreate } from "@/apis/kyc/kyc-api";

type PersonalInfo = {
  firstName: string;
  lastName: string;
  dob: string;
  phoneNumber: string;
  address: string;
  documentNumber: string;
};

type DocumentInfo = {
  type: string;
  documentFront: any;
  documentBack?: any;
  selfie: any;
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
    documentNumber: '',
  });
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>({
    type: '',
    documentFront: null,
    documentBack: null,
    selfie: null,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check existing KYC status
  const { data: kycStatus, isLoading: isLoadingKYC } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: checkKYCStatus,
  });

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

  // Check if user already has KYC submitted
  useEffect(() => {
    if (kycStatus?.data) {
      const status = kycStatus.data.status;
      if (status === 'approved') {
        Alert.alert(
          'KYC Already Approved',
          'Your KYC has already been approved. You can proceed with all features.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/settings') }]
        );
      } else if (status === 'pending') {
        Alert.alert(
          'KYC Under Review',
          'Your KYC is currently under review. Please wait for approval.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/settings') }]
        );
      } else if (status === 'rejected') {
        Alert.alert(
          'KYC Rejected',
          `Your KYC was rejected. Reason: ${kycStatus.data.rejection_reason || 'No reason provided'}`,
          [{ text: 'OK' }]
        );
      }
    }
  }, [kycStatus]);

  const handleDocumentPick = async (type: 'front' | 'back') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        if (type === 'front') {
          setDocumentInfo(prev => ({ ...prev, documentFront: asset }));
        } else {
          setDocumentInfo(prev => ({ ...prev, documentBack: asset }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleSelfiePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Camera permission is required to take a selfie');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setDocumentInfo(prev => ({ ...prev, selfie: asset }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take selfie');
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
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(personalInfo.dob)) {
      Alert.alert('Validation Error', 'Please enter date of birth in YYYY-MM-DD format (e.g., 1990-01-15)');
      return false;
    }
    if (!personalInfo.phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return false;
    }
    if (!personalInfo.address.trim()) {
      Alert.alert('Validation Error', 'Please enter your address');
      return false;
    }
    if (!personalInfo.documentNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your document number');
      return false;
    }
    return true;
  };

  const validateDocumentInfo = (): boolean => {
    if (!documentInfo.type) {
      Alert.alert('Validation Error', 'Please select a document type');
      return false;
    }
    if (!documentInfo.documentFront) {
      Alert.alert('Validation Error', 'Please upload the front of your document');
      return false;
    }
    if (!documentInfo.selfie) {
      Alert.alert('Validation Error', 'Please take a selfie');
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

  // KYC submission mutation
  const submitKYCMutation = useMutation({
    mutationFn: submitKYC,
    onSuccess: (data) => {
      setShowSuccess(true);
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      Alert.alert(
        'Submission Failed',
        error?.response?.data?.detail || 'Failed to submit KYC. Please try again.'
      );
    },
  });

  const handleSubmit = async () => {
    if (!validatePersonalInfo() || !validateDocumentInfo()) return;

    setIsSubmitting(true);

    try {
      // Prepare KYC data
      const kycData: KYCCreate = {
        full_name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        date_of_birth: personalInfo.dob, // Should be in YYYY-MM-DD format
        address: personalInfo.address,
        document_type: documentInfo.type as "passport" | "citizenship" | "driving_license",
        document_number: personalInfo.documentNumber,
      };

      console.log('KYC Data being sent:', kycData);

      // Convert files to File objects
      const documentFrontFile = await createFileFromAsset(documentInfo.documentFront, 'document_front');
      const selfieFile = await createFileFromAsset(documentInfo.selfie, 'selfie');
      const documentBackFile = documentInfo.documentBack 
        ? await createFileFromAsset(documentInfo.documentBack, 'document_back')
        : undefined;

      // Submit KYC
      await submitKYCMutation.mutateAsync({
        kyc_data: JSON.stringify(kycData),
        document_front: documentFrontFile,
        selfie: selfieFile,
        document_back: documentBackFile,
      });

    } catch (error) {
      console.error('KYC submission error:', error);
      setIsSubmitting(false);
    }
  };

  // Helper function to convert asset to File-like object for React Native
  const createFileFromAsset = async (asset: any, filename: string): Promise<any> => {
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      
      // Create a File-like object that works with React Native
      const file = {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: filename,
        size: asset.size || blob.size,
      };
      
      return file;
    } catch (error) {
      console.error('Error creating file from asset:', error);
      throw new Error(`Failed to process ${filename}`);
    }
  };

  const steps = [
    { id: 'personal', title: 'Personal Information' },
    { id: 'document', title: 'Document Upload' },
    { id: 'preview', title: 'Review & Submit' },
  ];

  // Show loading if checking KYC status
  if (isLoadingKYC) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Checking KYC status...</Text>
      </View>
    );
  }

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
                  placeholder="YYYY-MM-DD"
                  // keyboardType="numeric"
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

              <View style={styles.formGroup}>
                <Text style={styles.label}>Document Number</Text>
                <TextInput
                  style={styles.input}
                  value={personalInfo.documentNumber}
                  onChangeText={(text) => handlePersonalInfoChange('documentNumber', text)}
                  placeholder="Enter your document number"
                />
              </View>
            </View>
          )}

          {currentStep === 'document' && (
            <View style={styles.stepContent}>
              <Text style={styles.sectionTitle}>Document Verification</Text>
              <Text style={styles.sectionSubtitle}>Upload a government-issued ID and take a selfie</Text>

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
                      label="Citizenship"
                      value="citizenship"
                      color={Colors.textPrimary}
                    />
                    <Picker.Item
                      label="Driving License"
                      value="driving_license"
                      color={Colors.textPrimary}
                    />
                  </Picker>
                </View>
              </View>

              <View style={styles.uploadSection}>
                <Text style={styles.uploadSectionTitle}>Document Front</Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleDocumentPick('front')}
                >
                  <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
                  <Text style={styles.uploadButtonText}>
                    {documentInfo.documentFront ? 'Change Document Front' : 'Upload Document Front'}
                  </Text>
                </TouchableOpacity>

                {documentInfo.documentFront && (
                  <View style={styles.uploadPreview}>
                    <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                    <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                      {documentInfo.documentFront.name}
                    </Text>
                    <TouchableOpacity onPress={() => setDocumentInfo(prev => ({ ...prev, documentFront: null }))}>
                      <Ionicons name="close-circle" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.uploadSection}>
                <Text style={styles.uploadSectionTitle}>Document Back (Optional)</Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleDocumentPick('back')}
                >
                  <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
                  <Text style={styles.uploadButtonText}>
                    {documentInfo.documentBack ? 'Change Document Back' : 'Upload Document Back'}
                  </Text>
                </TouchableOpacity>

                {documentInfo.documentBack && (
                  <View style={styles.uploadPreview}>
                    <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                    <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                      {documentInfo.documentBack.name}
                    </Text>
                                         <TouchableOpacity onPress={() => setDocumentInfo(prev => ({ ...prev, documentBack: null }))}>
                       <Ionicons name="close-circle" size={20} color="#F44336" />
                     </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.uploadSection}>
                <Text style={styles.uploadSectionTitle}>Selfie</Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleSelfiePick}
                >
                  <Ionicons name="camera-outline" size={24} color={Colors.primary} />
                  <Text style={styles.uploadButtonText}>
                    {documentInfo.selfie ? 'Retake Selfie' : 'Take Selfie'}
                  </Text>
                </TouchableOpacity>

                {documentInfo.selfie && (
                  <View style={styles.uploadPreview}>
                    <Ionicons name="person-outline" size={20} color={Colors.primary} />
                    <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                      Selfie captured
                    </Text>
                                         <TouchableOpacity onPress={() => setDocumentInfo(prev => ({ ...prev, selfie: null }))}>
                       <Ionicons name="close-circle" size={20} color="#F44336" />
                     </TouchableOpacity>
                  </View>
                )}
              </View>
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
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Document Number:</Text>
                  <Text style={styles.reviewValue}>{personalInfo.documentNumber}</Text>
                </View>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Document Information</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Document Type:</Text>
                  <Text style={styles.reviewValue}>
                    {documentInfo.type === 'passport' && 'Passport'}
                    {documentInfo.type === 'citizenship' && 'Citizenship'}
                    {documentInfo.type === 'driving_license' && "Driving License"}
                  </Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Document Front:</Text>
                  <Text style={styles.reviewValue} numberOfLines={1} ellipsizeMode="middle">
                    {documentInfo.documentFront?.name}
                  </Text>
                </View>
                {documentInfo.documentBack && (
                  <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>Document Back:</Text>
                    <Text style={styles.reviewValue} numberOfLines={1} ellipsizeMode="middle">
                      {documentInfo.documentBack.name}
                    </Text>
                  </View>
                )}
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Selfie:</Text>
                  <Text style={styles.reviewValue}>
                    {documentInfo.selfie ? 'Captured' : 'Not captured'}
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
              style={[styles.verifyButton, isSubmitting && styles.verifyButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Text style={styles.verifyButtonText}>Submit KYC</Text>
              )}
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
    paddingTop: 20,
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
  uploadSection: {
    marginBottom: 20,
  },
  uploadSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
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
  uploadSection: {
    marginBottom: 20,
  },
  uploadSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
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
  verifyButtonDisabled: {
    opacity: 0.7,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 16,
  },
});

export default VerifyKyc;