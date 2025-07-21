import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { Picker } from "@react-native-picker/picker";

const VerifyKyc = () => {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedDocument, setUploadedDocument] =
    useState<null | DocumentPicker.DocumentResult>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>("");

  const handleDocumentPick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setUploadedDocument(result.assets[0]);
    }
  };

  const kycSteps = [
    {
      id: 1,
      title: "Personal Information",
      description: "Verify your identity details",
      completed: true,
      icon: "person-outline",
      onPress: null,
    },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Your KYC</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.bannerCard}>
            <Ionicons
              name="shield-checkmark"
              size={32}
              color={Colors.success}
            />
            <Text style={styles.bannerTitle}>Secure your account</Text>
            <Text style={styles.bannerText}>
              Complete the steps below to verify your identity and unlock full
              features.
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>1 of 3 steps completed</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "33%" }]} />
            </View>
          </View>

          <View style={styles.stepsContainer}>
            {/* Step 1: Personal Info */}
            {kycSteps.map((step) => (
              <TouchableOpacity
                key={step.id}
                style={styles.stepCard}
                activeOpacity={step.onPress ? 0.7 : 1}
                onPress={step.onPress ?? undefined}
              >
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.stepIcon,
                      step.completed
                        ? styles.completedIcon
                        : styles.pendingIcon,
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={20}
                      color={
                        step.completed ? Colors.textInverse : Colors.primary
                      }
                    />
                  </View>
                  <View style={styles.stepText}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDescription}>
                      {step.description}
                    </Text>
                  </View>
                </View>
                {step.completed ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.success}
                  />
                ) : (
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={Colors.neutral400}
                  />
                )}
              </TouchableOpacity>
            ))}

            {/* Step 2: Document Type */}
            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}>Select Document Type</Text>
              <View style={styles.dropdownContainer}>
                <Picker
                  selectedValue={selectedDocType}
                  onValueChange={(itemValue) => setSelectedDocType(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={Colors.textPrimary}
                  mode="dropdown"
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
                    value="nid"
                    color={Colors.textPrimary}
                  />
                  <Picker.Item
                    label="Driver's License"
                    value="license"
                    color={Colors.textPrimary}
                  />
                </Picker>
              </View>
            </View>

            {/* Step 3: Upload Document */}
            <TouchableOpacity
              style={styles.stepCard}
              activeOpacity={0.7}
              onPress={handleDocumentPick}
            >
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.stepIcon,
                    uploadedDocument
                      ? styles.completedIcon
                      : styles.pendingIcon,
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={
                      uploadedDocument ? Colors.textInverse : Colors.primary
                    }
                  />
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>Document Upload</Text>
                  <Text style={styles.stepDescription}>
                    Upload government-issued ID
                  </Text>
                </View>
              </View>
              {uploadedDocument ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.success}
                />
              ) : (
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={Colors.neutral400}
                />
              )}
            </TouchableOpacity>

            {/* Uploaded File Preview */}
            {uploadedDocument && (
              <View style={styles.uploadPreview}>
                <Ionicons
                  name="document-attach-outline"
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.fileName}>{uploadedDocument.name}</Text>
                <TouchableOpacity onPress={() => setUploadedDocument(null)}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Colors.danger}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          

          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => setShowSuccess(true)}
          >
            <Text style={styles.verifyButtonText}>Confirm</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};
export default VerifyKyc;

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
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    width: "100%",
    backgroundColor: Colors.neutral200,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  stepsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 30,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stepLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  completedIcon: {
    backgroundColor: Colors.success,
  },
  pendingIcon: {
    backgroundColor: Colors.neutral100,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  stepText: {
    gap: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  stepDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  uploadPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.neutral100,
    padding: 12,
    borderRadius: 8,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    marginBottom: 20,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  verifyButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownWrapper: {
    marginTop: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 30,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  dropdownContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: Colors.textPrimary,
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
