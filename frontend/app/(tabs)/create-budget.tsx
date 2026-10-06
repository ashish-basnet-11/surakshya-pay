"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Colors from "@/constants/Colors"
import { useFocusEffect } from "expo-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { budgetApi, BudgetCreate } from "@/apis/budget/budget-api"
import { Picker } from "@react-native-picker/picker"

const budgetTypes = [
  { value: "expense", label: "Expense", icon: "trending-down", color: "#F44336" },
  { value: "savings", label: "Savings", icon: "wallet", color: "#4CAF50" },
  { value: "investment", label: "Investment", icon: "trending-up", color: "#2196F3" },
]

const budgetCategories = [
  { value: "Food & Dining", color: "#FF6B6B", icon: "restaurant" },
  { value: "Transportation", color: "#4ECDC4", icon: "car" },
  { value: "Entertainment", color: "#45B7D1", icon: "game-controller" },
  { value: "Shopping", color: "#96CEB4", icon: "bag" },
  { value: "Bills & Utilities", color: "#FFEAA7", icon: "receipt" },
  { value: "Healthcare", color: "#FD79A8", icon: "medical" },
  { value: "Education", color: "#6C5CE7", icon: "school" },
  { value: "Travel", color: "#00B894", icon: "airplane" },
  { value: "Home & Garden", color: "#FDCB6E", icon: "home" },
  { value: "Personal Care", color: "#E17055", icon: "cut" },
]

const budgetIcons = [
  { value: "wallet", icon: "wallet" },
  { value: "restaurant", icon: "restaurant" },
  { value: "car", icon: "car" },
  { value: "game-controller", icon: "game-controller" },
  { value: "bag", icon: "bag" },
  { value: "receipt", icon: "receipt" },
  { value: "medical", icon: "medical" },
  { value: "school", icon: "school" },
  { value: "airplane", icon: "airplane" },
  { value: "home", icon: "home" },
  { value: "cut", icon: "cut" },
  { value: "trending-up", icon: "trending-up" },
  { value: "trending-down", icon: "trending-down" },
  { value: "gift", icon: "gift" },
  { value: "fitness", icon: "fitness" },
]

export default function CreateBudgetScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<BudgetCreate>({
    name: "",
    description: "",
    category: "",
    budget_amount: 0,
    budget_type: "expense",
    color: "#4CAF50",
    icon: "wallet",
    start_date: new Date().toISOString().split("T")[0],
    end_date: undefined,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.back()
        return true
      }

      const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress)
      return () => backHandler.remove()
    }, [])
  )

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const createBudgetMutation = useMutation({
    mutationFn: budgetApi.createBudget,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] })
      queryClient.invalidateQueries({ queryKey: ["budget-analytics"] })
      Alert.alert(
        "Success!",
        "Budget created successfully!",
        [
          {
            text: "View Budgets",
            onPress: () => router.push("/(tabs)/wallet"),
          },
          {
            text: "Create Another",
            onPress: () => resetForm(),
          },
        ]
      )
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.detail || "Failed to create budget. Please try again."
      )
    },
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Budget name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Budget name must be at least 3 characters"
    }

    if (!formData.category) {
      newErrors.category = "Please select a category"
    }

    if (!formData.budget_amount || formData.budget_amount <= 0) {
      newErrors.budget_amount = "Budget amount must be greater than 0"
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required"
    }

    if (formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      console.log("Submitting budget data:", formData)
      await createBudgetMutation.mutateAsync(formData)
    } catch (error) {
      console.error("Budget creation error:", error)
      console.error("Error details:", error?.response?.data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      budget_amount: 0,
      budget_type: "expense",
      color: "#4CAF50",
      icon: "wallet",
      start_date: new Date().toISOString().split("T")[0],
      end_date: undefined,
    })
    setErrors({})
  }

  const updateFormData = (field: keyof BudgetCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getSelectedCategoryColor = () => {
    const category = budgetCategories.find(cat => cat.value === formData.category)
    return category?.color || "#4CAF50"
  }

  const getSelectedTypeColor = () => {
    const type = budgetTypes.find(t => t.value === formData.budget_type)
    return type?.color || "#4CAF50"
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Budget</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={resetForm} style={styles.headerButton}>
            <Ionicons name="refresh" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Budget Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Type</Text>
            <View style={styles.typeContainer}>
              {budgetTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    formData.budget_type === type.value && {
                      backgroundColor: `${type.color}15`,
                      borderColor: type.color,
                    },
                  ]}
                  onPress={() => updateFormData("budget_type", type.value)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={formData.budget_type === type.value ? type.color : "#666"}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.budget_type === type.value && { color: type.color },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            {/* Budget Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Budget Name *</Text>
              <TextInput
                style={[styles.textInput, errors.name && styles.inputError]}
                placeholder="e.g., Monthly Food Budget"
                value={formData.name}
                onChangeText={(text) => updateFormData("name", text)}
                maxLength={255}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your budget purpose..."
                value={formData.description}
                onChangeText={(text) => updateFormData("description", text)}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category *</Text>
              <View style={[styles.pickerContainer, errors.category && styles.inputError]}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => {
                    updateFormData("category", value)
                    const category = budgetCategories.find(cat => cat.value === value)
                    if (category) {
                      updateFormData("color", category.color)
                      updateFormData("icon", category.icon)
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a category" value="" />
                  {budgetCategories.map((category) => (
                    <Picker.Item
                      key={category.value}
                      label={category.value}
                      value={category.value}
                    />
                  ))}
                </Picker>
                {formData.category && (
                  <View style={[styles.categoryPreview, { backgroundColor: getSelectedCategoryColor() }]}>
                    <Ionicons name={budgetCategories.find(cat => cat.value === formData.category)?.icon as any} size={16} color="white" />
                  </View>
                )}
              </View>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            {/* Budget Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Budget Amount (NPR) *</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>NPR</Text>
                <TextInput
                  style={[styles.textInput, styles.amountInput, errors.budget_amount && styles.inputError]}
                  placeholder="0.00"
                  value={formData.budget_amount ? formData.budget_amount.toString() : ""}
                  onChangeText={(text) => {
                    const amount = parseFloat(text) || 0
                    updateFormData("budget_amount", amount)
                  }}
                  keyboardType="numeric"
                />
              </View>
              {errors.budget_amount && <Text style={styles.errorText}>{errors.budget_amount}</Text>}
            </View>
          </View>

          {/* Customization */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customization</Text>
            
            {/* Color Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Color</Text>
              <View style={styles.colorContainer}>
                {["#4CAF50", "#F44336", "#2196F3", "#FF9800", "#9C27B0", "#00BCD4", "#FF5722", "#795548"].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      formData.color === color && styles.colorButtonSelected,
                    ]}
                    onPress={() => updateFormData("color", color)}
                  >
                    {formData.color === color && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Icon Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Icon</Text>
              <View style={styles.iconContainer}>
                {budgetIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon.value}
                    style={[
                      styles.iconButton,
                      formData.icon === icon.value && {
                        backgroundColor: `${formData.color}15`,
                        borderColor: formData.color,
                      },
                    ]}
                    onPress={() => updateFormData("icon", icon.value)}
                  >
                    <Ionicons
                      name={icon.icon as any}
                      size={20}
                      color={formData.icon === icon.value ? formData.color : "#666"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date Range</Text>
            
            {/* Start Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Date *</Text>
              <TextInput
                style={[styles.textInput, errors.start_date && styles.inputError]}
                placeholder="YYYY-MM-DD"
                value={formData.start_date}
                onChangeText={(text) => updateFormData("start_date", text)}
              />
              {errors.start_date && <Text style={styles.errorText}>{errors.start_date}</Text>}
            </View>

            {/* End Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Date (Optional)</Text>
              <TextInput
                style={[styles.textInput, errors.end_date && styles.inputError]}
                placeholder="YYYY-MM-DD (Leave empty for ongoing budget)"
                value={formData.end_date}
                onChangeText={(text) => updateFormData("end_date", text)}
              />
              {errors.end_date && <Text style={styles.errorText}>{errors.end_date}</Text>}
            </View>
          </View>

          {/* Budget Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Preview</Text>
            <View style={[styles.previewCard, { borderLeftColor: formData.color }]}>
              <View style={styles.previewHeader}>
                <View style={[styles.previewIcon, { backgroundColor: `${formData.color}15` }]}>
                  <Ionicons name={formData.icon as any} size={24} color={formData.color} />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{formData.name || "Budget Name"}</Text>
                  <Text style={styles.previewCategory}>{formData.category || "Category"}</Text>
                  <Text style={styles.previewType}>
                    {budgetTypes.find(t => t.value === formData.budget_type)?.label}
                  </Text>
                </View>
              </View>
              <View style={styles.previewAmount}>
                <Text style={styles.previewAmountLabel}>Budget Amount</Text>
                <Text style={styles.previewAmountValue}>
                  NPR {formData.budget_amount?.toLocaleString() || "0"}
                </Text>
              </View>
              {formData.description && (
                <Text style={styles.previewDescription}>{formData.description}</Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                { backgroundColor: formData.color },
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Creating...</Text>
              ) : (
                <Text style={styles.submitButtonText}>Create Budget</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  amountInput: {
    flex: 1,
    marginLeft: 8,
  },
  inputError: {
    borderColor: "#F44336",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },
  picker: {
    flex: 1,
  },
  categoryPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginRight: 8,
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  previewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  previewCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  previewType: {
    fontSize: 12,
    color: "#999",
    textTransform: "uppercase",
    fontWeight: "500",
  },
  previewAmount: {
    marginBottom: 12,
  },
  previewAmountLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  previewAmountValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  previewDescription: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
}) 