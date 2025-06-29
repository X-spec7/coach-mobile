import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { fetchAllFoods, Food } from "../services/api";

const { width } = Dimensions.get("window");

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface MealPlanFoodItem {
  food_item: number;
  amount: number;
  unit: string;
}

interface MealTime {
  time: string;
  day: DayOfWeek;
  mealplan_food_items: MealPlanFoodItem[];
}

interface CreateMealPlanData {
  name: string;
  visibility: "private" | "public";
  description: string;
  carb: number;
  protein: number;
  fat: number;
  is_ai_generated: boolean;
  meal_times: MealTime[];
  image?: string;
}

interface CreateMealPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMealPlanData) => Promise<void>;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const UNITS = ["g", "kg", "ml", "l", "oz", "lb"];

export default function CreateMealPlanModal({
  visible,
  onClose,
  onSubmit,
}: CreateMealPlanModalProps) {
  const colorScheme = useColorScheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foodItems, setFoodItems] = useState<Food[]>([]);
  const [selectedFoodItem, setSelectedFoodItem] = useState<number | null>(null);
  const [foodAmount, setFoodAmount] = useState<string>("");
  const [foodUnit, setFoodUnit] = useState<string>("g");
  const [mealPlan, setMealPlan] = useState<CreateMealPlanData>({
    name: "",
    visibility: "private",
    description: "",
    carb: 0,
    protein: 0,
    fat: 0,
    is_ai_generated: false,
    meal_times: [],
  });

  console.log("CreateMealPlanModal - visible:", visible);

  useEffect(() => {
    if (visible) {
      fetchFoodItems();
    }
  }, [visible]);

  const fetchFoodItems = async () => {
    try {
      const foods = await fetchAllFoods();
      setFoodItems(foods);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch food items");
    }
  };

  const handleInputChange = (
    field: keyof CreateMealPlanData,
    value: string | number
  ) => {
    setMealPlan((prev) => ({
      ...prev,
      [field]: typeof value === "number" ? value : value,
    }));
  };

  const handleAddMealTime = () => {
    setMealPlan((prev) => ({
      ...prev,
      meal_times: [
        ...prev.meal_times,
        {
          time: "",
          day: "monday",
          mealplan_food_items: [],
        },
      ],
    }));
  };

  const handleMealTimeChange = (
    index: number,
    field: keyof MealTime,
    value: string | DayOfWeek
  ) => {
    setMealPlan((prev) => {
      const updatedMealTimes = [...prev.meal_times];
      updatedMealTimes[index] = {
        ...updatedMealTimes[index],
        [field]: value,
      };
      return {
        ...prev,
        meal_times: updatedMealTimes,
      };
    });
  };

  const handleAddFoodItem = (mealTimeIndex: number) => {
    if (
      selectedFoodItem === null ||
      !foodAmount ||
      parseFloat(foodAmount) <= 0
    ) {
      Alert.alert(
        "Error",
        "Please select a food item and enter a valid amount"
      );
      return;
    }

    const selectedFood = foodItems[selectedFoodItem];
    if (!selectedFood) {
      Alert.alert("Error", "Selected food item not found");
      return;
    }

    setMealPlan((prev) => {
      const updatedMealTimes = [...prev.meal_times];
      updatedMealTimes[mealTimeIndex] = {
        ...updatedMealTimes[mealTimeIndex],
        mealplan_food_items: [
          ...updatedMealTimes[mealTimeIndex].mealplan_food_items,
          {
            food_item: selectedFoodItem,
            amount: parseFloat(foodAmount),
            unit: foodUnit,
          },
        ],
      };
      return {
        ...prev,
        meal_times: updatedMealTimes,
      };
    });

    // Reset form
    setSelectedFoodItem(null);
    setFoodAmount("");
    setFoodUnit("g");
  };

  const handleRemoveFoodItem = (
    mealTimeIndex: number,
    foodItemIndex: number
  ) => {
    setMealPlan((prev) => {
      const updatedMealTimes = [...prev.meal_times];
      updatedMealTimes[mealTimeIndex] = {
        ...updatedMealTimes[mealTimeIndex],
        mealplan_food_items: updatedMealTimes[
          mealTimeIndex
        ].mealplan_food_items.filter((_, index) => index !== foodItemIndex),
      };
      return {
        ...prev,
        meal_times: updatedMealTimes,
      };
    });
  };

  const validateForm = (): boolean => {
    if (!mealPlan.name.trim()) {
      Alert.alert("Error", "Please enter a meal plan name");
      return false;
    }
    if (!mealPlan.description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return false;
    }
    if (mealPlan.carb <= 0 || mealPlan.protein <= 0 || mealPlan.fat <= 0) {
      Alert.alert("Error", "Please enter valid macro values");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(mealPlan);
      Alert.alert("Success", "Meal plan created successfully!", [
        { text: "OK", onPress: onClose },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create meal plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            { backgroundColor: Colors[colorScheme ?? "light"].background },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={Colors[colorScheme ?? "light"].text}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.headerTitle,
                { color: Colors[colorScheme ?? "light"].text },
              ]}
            >
              Create Meal Plan
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Basic Information */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
              >
                Basic Information
              </Text>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: Colors[colorScheme ?? "light"].text },
                  ]}
                >
                  Name *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: "#f8f9fa",
                      color: Colors[colorScheme ?? "light"].text,
                      borderColor: "#e9ecef",
                    },
                  ]}
                  value={mealPlan.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  placeholder="Enter meal plan name"
                  placeholderTextColor="#6c757d"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: Colors[colorScheme ?? "light"].text },
                  ]}
                >
                  Visibility
                </Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      mealPlan.visibility === "private" &&
                        styles.radioButtonSelected,
                    ]}
                    onPress={() => handleInputChange("visibility", "private")}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        { color: Colors[colorScheme ?? "light"].text },
                      ]}
                    >
                      Private
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      mealPlan.visibility === "public" &&
                        styles.radioButtonSelected,
                    ]}
                    onPress={() => handleInputChange("visibility", "public")}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        { color: Colors[colorScheme ?? "light"].text },
                      ]}
                    >
                      Public
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: Colors[colorScheme ?? "light"].text },
                  ]}
                >
                  Description *
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: "#f8f9fa",
                      color: Colors[colorScheme ?? "light"].text,
                      borderColor: "#e9ecef",
                    },
                  ]}
                  value={mealPlan.description}
                  onChangeText={(value) =>
                    handleInputChange("description", value)
                  }
                  placeholder="Describe your meal plan"
                  placeholderTextColor="#6c757d"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Macros */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
              >
                Macronutrients
              </Text>

              <View style={styles.macrosGrid}>
                <View style={styles.macroInput}>
                  <Text
                    style={[
                      styles.label,
                      { color: Colors[colorScheme ?? "light"].text },
                    ]}
                  >
                    Carbs (g) *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: "#f8f9fa",
                        color: Colors[colorScheme ?? "light"].text,
                        borderColor: "#e9ecef",
                      },
                    ]}
                    value={mealPlan.carb.toString()}
                    onChangeText={(value) =>
                      handleInputChange("carb", parseFloat(value) || 0)
                    }
                    placeholder="0"
                    placeholderTextColor="#6c757d"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.macroInput}>
                  <Text
                    style={[
                      styles.label,
                      { color: Colors[colorScheme ?? "light"].text },
                    ]}
                  >
                    Protein (g) *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: "#f8f9fa",
                        color: Colors[colorScheme ?? "light"].text,
                        borderColor: "#e9ecef",
                      },
                    ]}
                    value={mealPlan.protein.toString()}
                    onChangeText={(value) =>
                      handleInputChange("protein", parseFloat(value) || 0)
                    }
                    placeholder="0"
                    placeholderTextColor="#6c757d"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.macroInput}>
                  <Text
                    style={[
                      styles.label,
                      { color: Colors[colorScheme ?? "light"].text },
                    ]}
                  >
                    Fat (g) *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: "#f8f9fa",
                        color: Colors[colorScheme ?? "light"].text,
                        borderColor: "#e9ecef",
                      },
                    ]}
                    value={mealPlan.fat.toString()}
                    onChangeText={(value) =>
                      handleInputChange("fat", parseFloat(value) || 0)
                    }
                    placeholder="0"
                    placeholderTextColor="#6c757d"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Meal Times */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: Colors[colorScheme ?? "light"].text },
                  ]}
                >
                  Meal Times
                </Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddMealTime}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Add Meal Time</Text>
                </TouchableOpacity>
              </View>

              {mealPlan.meal_times.map((mealTime, index) => (
                <View key={index} style={styles.mealTimeCard}>
                  <View style={styles.mealTimeHeader}>
                    <Text
                      style={[
                        styles.mealTimeTitle,
                        { color: Colors[colorScheme ?? "light"].text },
                      ]}
                    >
                      Meal Time {index + 1}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setMealPlan((prev) => ({
                          ...prev,
                          meal_times: prev.meal_times.filter(
                            (_, i) => i !== index
                          ),
                        }));
                      }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#dc3545"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.mealTimeInputs}>
                    <View style={styles.timeInput}>
                      <Text
                        style={[
                          styles.label,
                          { color: Colors[colorScheme ?? "light"].text },
                        ]}
                      >
                        Time
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: "#f8f9fa",
                            color: Colors[colorScheme ?? "light"].text,
                            borderColor: "#e9ecef",
                          },
                        ]}
                        value={mealTime.time}
                        onChangeText={(value) =>
                          handleMealTimeChange(index, "time", value)
                        }
                        placeholder="12:00"
                        placeholderTextColor="#6c757d"
                      />
                    </View>

                    <View style={styles.dayInput}>
                      <Text
                        style={[
                          styles.label,
                          { color: Colors[colorScheme ?? "light"].text },
                        ]}
                      >
                        Day
                      </Text>
                      <View style={styles.pickerContainer}>
                        {DAYS_OF_WEEK.map((day) => (
                          <TouchableOpacity
                            key={day}
                            style={[
                              styles.dayButton,
                              mealTime.day === day && styles.dayButtonSelected,
                            ]}
                            onPress={() =>
                              handleMealTimeChange(index, "day", day)
                            }
                          >
                            <Text
                              style={[
                                styles.dayButtonText,
                                mealTime.day === day &&
                                  styles.dayButtonTextSelected,
                              ]}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Food Items */}
                  <View style={styles.foodItemsSection}>
                    <Text
                      style={[
                        styles.label,
                        { color: Colors[colorScheme ?? "light"].text },
                      ]}
                    >
                      Food Items
                    </Text>

                    <View style={styles.addFoodRow}>
                      <View style={styles.foodSelect}>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              backgroundColor: "#f8f9fa",
                              color: Colors[colorScheme ?? "light"].text,
                              borderColor: "#e9ecef",
                            },
                          ]}
                          value={
                            selectedFoodItem !== null
                              ? foodItems[selectedFoodItem]?.name || ""
                              : ""
                          }
                          placeholder="Select food item"
                          placeholderTextColor="#6c757d"
                          onFocus={() => {
                            // Show food picker modal or dropdown
                            Alert.alert(
                              "Select Food",
                              "Food picker will be implemented"
                            );
                          }}
                        />
                      </View>

                      <View style={styles.amountInput}>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              backgroundColor: "#f8f9fa",
                              color: Colors[colorScheme ?? "light"].text,
                              borderColor: "#e9ecef",
                            },
                          ]}
                          value={foodAmount}
                          onChangeText={setFoodAmount}
                          placeholder="Amount"
                          placeholderTextColor="#6c757d"
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.unitInput}>
                        <View style={styles.pickerContainer}>
                          {UNITS.slice(0, 3).map((unit) => (
                            <TouchableOpacity
                              key={unit}
                              style={[
                                styles.unitButton,
                                foodUnit === unit && styles.unitButtonSelected,
                              ]}
                              onPress={() => setFoodUnit(unit)}
                            >
                              <Text
                                style={[
                                  styles.unitButtonText,
                                  foodUnit === unit &&
                                    styles.unitButtonTextSelected,
                                ]}
                              >
                                {unit}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.addFoodButton}
                        onPress={() => handleAddFoodItem(index)}
                      >
                        <Ionicons name="add" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>

                    {/* Food Items List */}
                    {mealTime.mealplan_food_items.map((foodItem, foodIndex) => {
                      const food = foodItems[foodItem.food_item];
                      return (
                        <View key={foodIndex} style={styles.foodItemRow}>
                          <Text
                            style={[
                              styles.foodItemName,
                              { color: Colors[colorScheme ?? "light"].text },
                            ]}
                          >
                            {food?.name || "Unknown"}
                          </Text>
                          <Text
                            style={[
                              styles.foodItemAmount,
                              { color: Colors[colorScheme ?? "light"].text },
                            ]}
                          >
                            {foodItem.amount} {foodItem.unit}
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              handleRemoveFoodItem(index, foodIndex)
                            }
                          >
                            <Ionicons
                              name="trash-outline"
                              size={16}
                              color="#dc3545"
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Create Meal Plan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 12,
  },
  radioButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  radioText: {
    fontSize: 14,
    fontWeight: "500",
  },
  macrosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  macroInput: {
    flex: 1,
    minWidth: width * 0.4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  mealTimeCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  mealTimeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealTimeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  mealTimeInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
  },
  dayInput: {
    flex: 2,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  dayButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  dayButtonSelected: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  dayButtonText: {
    fontSize: 12,
    color: "#6c757d",
  },
  dayButtonTextSelected: {
    color: "#fff",
  },
  foodItemsSection: {
    marginTop: 12,
  },
  addFoodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  foodSelect: {
    flex: 2,
  },
  amountInput: {
    flex: 1,
  },
  unitInput: {
    flex: 1,
  },
  unitButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  unitButtonSelected: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  unitButtonText: {
    fontSize: 12,
    color: "#6c757d",
  },
  unitButtonTextSelected: {
    color: "#fff",
  },
  addFoodButton: {
    backgroundColor: "#7C3AED",
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  foodItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  foodItemName: {
    flex: 1,
    fontSize: 14,
  },
  foodItemAmount: {
    fontSize: 14,
    marginRight: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
