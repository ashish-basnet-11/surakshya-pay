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
import { useRouter, useLocalSearchParams } from "expo-router"
import Colors from "@/constants/Colors"
import { useFocusEffect } from "expo-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { budgetApi, BudgetUpdate } from "@/apis/budget/budget-api"
import { Picker } from "@react-native-picker/picker"
import Loader from "@/components/Loader"

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

export default function BudgetDetailScreen() {
  const router = useRouter()
  const { budgetId } = useLocalSearchParams<{ budgetId: string }>()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<BudgetUpdate>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Fetch budget details
  const { data: budgetData, isLoading } = useQuery({
    queryKey: ["budget", budgetId],
    queryFn: () => budgetApi.getBudget(parseInt(budgetId)),
    enabled: !!budgetId,
  })

  const budget = budgetData?.data

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

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BudgetUpdate }) => budgetApi.updateBudget(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] })
      queryClient.invalidateQueries({ queryKey: ["budget-analytics"] })
      queryClient.invalidateQueries({ queryKey: ["budget", budgetId] })
      setIsEditing(false)
      Alert.alert("Success!", "Budget updated successfully!")
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.detail || "Failed to update budget. Please try again."
      )
    },
  })

  const deleteBudgetMutation = useMutation({
    mutationFn: budgetApi.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] })
      queryClient.invalidateQueries({ queryKey: ["budget-analytics"] })
      Alert.alert("Success!", "Budget deleted successfully!", [
        { text: "OK", onPress: () => router.back() }
      ])
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.detail || "Failed to delete budget. Please try again."
      )
    },
  })

  const handleEdit = () => {
    if (budget) {
      setFormData({
        name: budget.name,
        description: budget.description,
        category: budget.category,
        budget_amount: budget.budget_amount,
        budget_type: budget.budget_type,
        color: budget.color,
        icon: budget.icon,
        start_date: budget.start_date,
        end_date: budget.end_date,
      })
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    if (!budgetId) return

    setIsSubmitting(true)
    try {
      console.log(formData);
      await updateBudgetMutation.mutateAsync({
        id: parseInt(budgetId),
        data: formData
      })
    } catch (error) {
      console.error("Budget update error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
    setErrors({})
  }

  const handleDelete = () => {
    if (!budgetId) return

    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBudgetMutation.mutate(parseInt(budgetId))
        },
      ]
    )
  }

  const updateFormData = (field: keyof BudgetUpdate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "#F44336"
    if (progress >= 90) return "#FF9800"
    if (progress >= 75) return "#2196F3"
    return "#4CAF50"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4CAF50"
      case "warning":
        return "#FF9800"
      case "completed":
        return "#2196F3"
      default:
        return "#666"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "checkmark-circle"
      case "warning":
        return "warning"
      case "completed":
        return "checkmark-done"
      default:
        return "help-circle"
    }
  }

  if (isLoading) {
    return (
      <Loader/>
    )
  }

  if (!budget) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Budget not found</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const progress = (budget.spent_amount / budget.budget_amount) * 100
  const remaining = budget.budget_amount - budget.spent_amount

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
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Budget" : budget.name}
        </Text>
        <View style={styles.headerActions}>
          {!isEditing ? (
            <>
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <Ionicons name="create" size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Ionicons name="trash" size={20} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Ionicons name="close" size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.headerButton, isSubmitting && styles.headerButtonDisabled]}
                disabled={isSubmitting}
              >
                <Ionicons name="checkmark" size={20} color="#ffffff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Budget Overview Card */}
          <View style={[styles.overviewCard, { borderLeftColor: budget.color }]}>
            <View style={styles.overviewHeader}>
              <View style={[styles.overviewIcon, { backgroundColor: `${budget.color}15` }]}>
                <Ionicons name={budget.icon as any} size={32} color={budget.color} />
              </View>
              <View style={styles.overviewInfo}>
                <Text style={styles.overviewName}>{budget.name}</Text>
                <Text style={styles.overviewCategory}>{budget.category}</Text>
                <View style={styles.overviewStatus}>
                  <Ionicons
                    name={getStatusIcon(budget.status) as any}
                    size={16}
                    color={getStatusColor(budget.status)}
                  />
                  <Text style={[styles.overviewStatusText, { color: getStatusColor(budget.status) }]}>
                    {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.overviewProgress}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: getProgressColor(progress),
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.overviewAmounts}>
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Spent</Text>
                <Text style={styles.amountValue}>NPR {budget.spent_amount.toLocaleString()}</Text>
              </View>
              <View style={styles.amountDivider} />
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Budget</Text>
                <Text style={styles.amountValue}>NPR {budget.budget_amount.toLocaleString()}</Text>
              </View>
              <View style={styles.amountDivider} />
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Remaining</Text>
                <Text style={[styles.amountValue, { color: remaining >= 0 ? "#4CAF50" : "#F44336" }]}>
                  NPR {Math.abs(remaining).toLocaleString()}
                </Text>
              </View>
            </View>

            {budget.description && (
              <Text style={styles.overviewDescription}>{budget.description}</Text>
            )}
          </View>

          {/* Edit Form */}
          {isEditing && (
            <View style={styles.editSection}>
              <Text style={styles.sectionTitle}>Edit Budget</Text>
              
              {/* Budget Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budget Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => updateFormData("name", text)}
                  maxLength={255}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => updateFormData("description", text)}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.category}
                    onValueChange={(value) => updateFormData("category", value)}
                    style={styles.picker}
                  >
                    {budgetCategories.map((category) => (
                      <Picker.Item
                        key={category.value}
                        label={category.value}
                        value={category.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Budget Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budget Amount (NPR)</Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>NPR</Text>
                  <TextInput
                    style={[styles.textInput, styles.amountInput]}
                    value={formData.budget_amount?.toString()}
                    onChangeText={(text) => {
                      const amount = parseFloat(text) || 0
                      updateFormData("budget_amount", amount)
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Color */}
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

              {/* Icon */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Icon</Text>
                <View style={styles.iconContainer}>
                  {budgetIcons.map((icon) => (
                    <TouchableOpacity
                      key={icon.value}
                      style={[
                        styles.iconButton,
                        formData.icon === icon.value && {
                          backgroundColor: `${formData.color || budget.color}15`,
                          borderColor: formData.color || budget.color,
                        },
                      ]}
                      onPress={() => updateFormData("icon", icon.value)}
                    >
                      <Ionicons
                        name={icon.icon as any}
                        size={20}
                        color={formData.icon === icon.value ? (formData.color || budget.color) : "#666"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Budget Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Budget Details</Text>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {budgetTypes.find(t => t.value === budget.budget_type)?.label}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>
                {new Date(budget.start_date).toLocaleDateString()}
              </Text>
            </View>

            {budget.end_date && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>End Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(budget.end_date).toLocaleDateString()}
                </Text>
              </View>
            )}

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {new Date(budget.created_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Updated</Text>
              <Text style={styles.detailValue}>
                {new Date(budget.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleEdit}
              >
                <Ionicons name="create" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Edit Budget</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Delete Budget</Text>
              </TouchableOpacity>
            </View>
          )}
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
    flex: 1,
    textAlign: "center",
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
  headerButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  contentWrapper: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    fontStyle: "italic",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 18,
    color: "#F44336",
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  overviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  overviewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  overviewInfo: {
    flex: 1,
  },
  overviewName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  overviewCategory: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  overviewStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  overviewStatusText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  overviewProgress: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  overviewAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  amountItem: {
    alignItems: "center",
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  amountDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  overviewDescription: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  editSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  picker: {
    height: 50,
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
  detailsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
}) 