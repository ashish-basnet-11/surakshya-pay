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
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Colors from "@/constants/Colors"
import { useFocusEffect } from "expo-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { budgetApi, BudgetCreate, Budget } from "@/apis/budget/budget-api"
import { Picker } from "@react-native-picker/picker"

const { width: screenWidth } = Dimensions.get('window')

const goalTypes = [
  { value: "savings", label: "Savings Goal", icon: "wallet", color: "#4CAF50" },
  { value: "investment", label: "Investment Goal", icon: "trending-up", color: "#2196F3" },
  { value: "debt_payoff", label: "Debt Payoff", icon: "card", color: "#F44336" },
  { value: "emergency_fund", label: "Emergency Fund", icon: "shield", color: "#FF9800" },
  { value: "vacation", label: "Vacation Fund", icon: "airplane", color: "#9C27B0" },
  { value: "home", label: "Home Purchase", icon: "home", color: "#00BCD4" },
]

const goalCategories = [
  { value: "Emergency Fund", color: "#FF9800", icon: "shield" },
  { value: "Vacation", color: "#9C27B0", icon: "airplane" },
  { value: "Home Purchase", color: "#00BCD4", icon: "home" },
  { value: "Car Purchase", color: "#FF5722", icon: "car" },
  { value: "Education", color: "#6C5CE7", icon: "school" },
  { value: "Wedding", color: "#E91E63", icon: "heart" },
  { value: "Retirement", color: "#607D8B", icon: "time" },
  { value: "Business", color: "#795548", icon: "briefcase" },
  { value: "Investment Portfolio", color: "#2196F3", icon: "trending-up" },
  { value: "Debt Payoff", color: "#F44336", icon: "card" },
]

const goalIcons = [
  { value: "wallet", icon: "wallet" },
  { value: "trending-up", icon: "trending-up" },
  { value: "card", icon: "card" },
  { value: "shield", icon: "shield" },
  { value: "airplane", icon: "airplane" },
  { value: "home", icon: "home" },
  { value: "car", icon: "car" },
  { value: "school", icon: "school" },
  { value: "heart", icon: "heart" },
  { value: "time", icon: "time" },
  { value: "briefcase", icon: "briefcase" },
  { value: "gift", icon: "gift" },
  { value: "fitness", icon: "fitness" },
  { value: "medical", icon: "medical" },
  { value: "restaurant", icon: "restaurant" },
]

export default function BudgetGoalsScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<BudgetCreate>({
    name: "",
    description: "",
    category: "",
    budget_amount: 0,
    budget_type: "savings",
    color: "#4CAF50",
    icon: "wallet",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGoalType, setSelectedGoalType] = useState("savings")
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Fetch existing savings and investment budgets
  const { data: existingGoals } = useQuery({
    queryKey: ["budgets", "savings", "investment"],
    queryFn: () => budgetApi.getBudgets({
      budget_type: "savings,investment",
      limit: 50
    }),
  })

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

  const createGoalMutation = useMutation({
    mutationFn: budgetApi.createBudget,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] })
      queryClient.invalidateQueries({ queryKey: ["budget-analytics"] })
      Alert.alert(
        "Success!",
        "Financial goal created successfully!",
        [
          {
            text: "View Goals",
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
        error?.response?.data?.detail || "Failed to create goal. Please try again."
      )
    },
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Goal name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Goal name must be at least 3 characters"
    }

    if (!formData.category) {
      newErrors.category = "Please select a goal category"
    }

    if (!formData.budget_amount || formData.budget_amount <= 0) {
      newErrors.budget_amount = "Target amount must be greater than 0"
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required"
    }

    if (formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = "Target date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const submitData = {
        ...formData,
        end_date: formData.end_date || undefined
      }
      await createGoalMutation.mutateAsync(submitData)
    } catch (error) {
      console.error("Goal creation error:", error)
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
      budget_type: "savings",
      color: "#4CAF50",
      icon: "wallet",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    })
    setErrors({})
    setSelectedGoalType("savings")
  }

  const updateFormData = (field: keyof BudgetCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getSelectedCategoryColor = () => {
    const category = goalCategories.find(cat => cat.value === formData.category)
    return category?.color || "#4CAF50"
  }

  const getSelectedTypeColor = () => {
    const type = goalTypes.find(t => t.value === selectedGoalType)
    return type?.color || "#4CAF50"
  }

  const calculateProgress = (goal: Budget) => {
    const progress = (goal.spent_amount / goal.budget_amount) * 100
    return Math.min(progress, 100)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "#4CAF50"
    if (progress >= 75) return "#FF9800"
    if (progress >= 50) return "#2196F3"
    return "#F44336"
  }

  const existingGoalsList = existingGoals?.data || []

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
        <Text style={styles.headerTitle}>Financial Goals</Text>
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
          {/* Existing Goals Summary */}
          {existingGoalsList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Current Goals</Text>
              <View style={styles.goalsSummary}>
                {existingGoalsList.slice(0, 3).map((goal: Budget) => {
                  const progress = calculateProgress(goal)
                  return (
                    <View key={goal.id} style={styles.goalCard}>
                      <View style={styles.goalHeader}>
                        <View style={[styles.goalIcon, { backgroundColor: `${goal.color}15` }]}>
                          <Ionicons name={goal.icon as any} size={20} color={goal.color} />
                        </View>
                        <View style={styles.goalInfo}>
                          <Text style={styles.goalName}>{goal.name}</Text>
                          <Text style={styles.goalCategory}>{goal.category}</Text>
                        </View>
                        <View style={styles.goalProgress}>
                          <Text style={styles.goalProgressText}>{Math.round(progress)}%</Text>
                        </View>
                      </View>
                      <View style={styles.goalProgressBar}>
                        <View
                          style={[
                            styles.goalProgressFill,
                            {
                              width: `${progress}%`,
                              backgroundColor: getProgressColor(progress),
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.goalAmounts}>
                        <Text style={styles.goalSpent}>
                          NPR {goal.spent_amount.toLocaleString()}
                        </Text>
                        <Text style={styles.goalTarget}>
                          of NPR {goal.budget_amount.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  )
                })}
                {existingGoalsList.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push("/(tabs)/wallet")}
                  >
                    <Text style={styles.viewAllText}>View All {existingGoalsList.length} Goals</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Goal Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goal Type</Text>
            <View style={styles.typeContainer}>
              {goalTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    selectedGoalType === type.value && {
                      backgroundColor: `${type.color}15`,
                      borderColor: type.color,
                    },
                  ]}
                  onPress={() => {
                    setSelectedGoalType(type.value)
                    updateFormData("budget_type", type.value === "debt_payoff" ? "expense" : type.value)
                  }}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={selectedGoalType === type.value ? type.color : "#666"}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedGoalType === type.value && { color: type.color },
                    ]}
                    numberOfLines={2}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goal Information</Text>
            
            {/* Goal Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Name *</Text>
              <TextInput
                style={[styles.textInput, errors.name && styles.inputError]}
                placeholder="e.g., Emergency Fund, Vacation Savings"
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
                placeholder="Describe your financial goal..."
                value={formData.description}
                onChangeText={(text) => updateFormData("description", text)}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Category *</Text>
              <View style={[styles.pickerContainer, errors.category && styles.inputError]}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => {
                    updateFormData("category", value)
                    const category = goalCategories.find(cat => cat.value === value)
                    if (category) {
                      updateFormData("color", category.color)
                      updateFormData("icon", category.icon)
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a goal category" value="" />
                  {goalCategories.map((category) => (
                    <Picker.Item
                      key={category.value}
                      label={category.value}
                      value={category.value}
                    />
                  ))}
                </Picker>
                {formData.category && (
                  <View style={[styles.categoryPreview, { backgroundColor: getSelectedCategoryColor() }]}>
                    <Ionicons name={goalCategories.find(cat => cat.value === formData.category)?.icon as any} size={16} color="white" />
                  </View>
                )}
              </View>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            {/* Target Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Amount (NPR) *</Text>
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
                {goalIcons.map((icon) => (
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

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            
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

            {/* Target Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Date (Optional)</Text>
              <TextInput
                style={[styles.textInput, errors.end_date && styles.inputError]}
                placeholder="YYYY-MM-DD (When do you want to achieve this goal?)"
                value={formData.end_date}
                onChangeText={(text) => updateFormData("end_date", text)}
              />
              {errors.end_date && <Text style={styles.errorText}>{errors.end_date}</Text>}
            </View>
          </View>

          {/* Goal Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goal Preview</Text>
            <View style={[styles.previewCard, { borderLeftColor: formData.color }]}>
              <View style={styles.previewHeader}>
                <View style={[styles.previewIcon, { backgroundColor: `${formData.color}15` }]}>
                  <Ionicons name={formData.icon as any} size={24} color={formData.color} />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{formData.name || "Goal Name"}</Text>
                  <Text style={styles.previewCategory}>{formData.category || "Category"}</Text>
                  <Text style={styles.previewType}>
                    {goalTypes.find(t => t.value === selectedGoalType)?.label}
                  </Text>
                </View>
              </View>
              <View style={styles.previewAmount}>
                <Text style={styles.previewAmountLabel}>Target Amount</Text>
                <Text style={styles.previewAmountValue}>
                  NPR {formData.budget_amount?.toLocaleString() || "0"}
                </Text>
              </View>
              {formData.description && (
                <Text style={styles.previewDescription}>{formData.description}</Text>
              )}
              {formData.end_date && (
                <Text style={styles.previewTimeline}>
                  Target Date: {new Date(formData.end_date).toLocaleDateString()}
                </Text>
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
                <Text style={styles.submitButtonText}>Create Goal</Text>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: 20,
    backgroundColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1000,
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
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    paddingBottom: 120,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  goalsSummary: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  goalCategory: {
    fontSize: 14,
    color: "#666",
  },
  goalProgress: {
    alignItems: "flex-end",
  },
  goalProgressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginBottom: 8,
  },
  goalProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  goalAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalSpent: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  goalTarget: {
    fontSize: 14,
    color: "#666",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary,
    marginRight: 8,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeButton: {
    width: (screenWidth - 64) / 2, // Account for padding and gap
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 24,
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
    minHeight: 48,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
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
    minHeight: 48,
  },
  picker: {
    flex: 1,
    height: 48,
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
    justifyContent: "flex-start",
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
    justifyContent: "flex-start",
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
    marginTop: 8,
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
    marginBottom: 8,
  },
  previewTimeline: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 32,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
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