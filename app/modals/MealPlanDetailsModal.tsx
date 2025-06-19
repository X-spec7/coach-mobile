import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import FoodDetailsModal from "./FoodDetailsModal";

// Update the interface to match the actual API response
interface MealPlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: any; // Using any for now since the API response structure is different
  onChoose: () => void;
  isLoading?: boolean; // Add loading prop
}

const CIRCLE_SIZE = 180;
const STROKE_WIDTH = 16;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const MealPlanDetailsModal: React.FC<MealPlanDetailsModalProps> = ({
  visible,
  onClose,
  plan,
  onChoose,
  isLoading,
}) => {
  console.log("=== MealPlanDetailsModal ===");
  console.log("visible:", visible);
  console.log("plan:", plan);
  console.log("plan.mealPlan:", plan?.mealPlan);
  console.log("plan.mealPlan.meal_times:", plan?.mealPlan?.meal_times);
  console.log("onChoose function:", onChoose);

  if (!plan || !plan.mealPlan) {
    console.log("No plan or mealPlan, returning null");
    return null;
  }

  // Extract the actual meal plan data
  const mealPlan = plan.mealPlan;

  // Define macros array as in AboutPlanModal
  const macros = [
    {
      key: "protein",
      label: "Protein",
      value: mealPlan.protein || 0,
      color: "#7C3AED",
    },
    { key: "fat", label: "Fat", value: mealPlan.fat || 0, color: "#F87171" },
    {
      key: "carbs",
      label: "Carbs",
      value: mealPlan.carb || 0,
      color: "#FBBF24",
    },
  ];

  // Calculate circle segments for macros (reference from AboutPlanModal)
  const TOTAL = macros.reduce((sum, m) => sum + (m.value || 0), 0) || 1; // Avoid division by zero
  let startAngle = 0;
  const macroSegments = macros.map((macro) => {
    const percent = macro.value / TOTAL;
    const length = percent * CIRCUMFERENCE;
    const segment = {
      color: macro.color,
      length,
      offset: startAngle,
    };
    startAngle += length;
    return segment;
  });

  // State for FoodDetailsModal
  const [showFoodDetails, setShowFoodDetails] = React.useState(false);
  const [selectedFood, setSelectedFood] = React.useState<any>(null);

  // Extract meals from meal_times
  const meals =
    mealPlan.meal_times?.flatMap(
      (mealTime: any) =>
        mealTime.mealplan_food_items?.map((foodItem: any) => {
          console.log("Processing food item:", foodItem);
          return {
            title:
              foodItem.name ||
              foodItem.food_item_details?.name ||
              "Unknown Food",
            protein: foodItem.protein || 0,
            fat: foodItem.fat || 0,
            carbs: foodItem.carbs || 0,
            time: mealTime.time,
            day: mealTime.day,
          };
        }) || []
    ) || [];

  const handleChoosePress = () => {
    console.log("Choose button pressed in MealPlanDetailsModal");
    if (isLoading) {
      console.log("Already loading, ignoring press");
      return;
    }
    console.log("Calling onChoose function");
    console.log("Current plan ID:", mealPlan.id);
    onChoose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{mealPlan.name}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Plan Description */}
            <Text style={styles.planDesc}>{mealPlan.description}</Text>
            {/* Macros Chart */}
            <View style={styles.macrosChart}>
              <View>
                <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                  {/* Background circle */}
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    stroke="#F1F5F9"
                    strokeWidth={STROKE_WIDTH}
                  />
                  {/* Macro Segments */}
                  {macroSegments.map((seg: any, idx: number) => (
                    <Circle
                      key={idx}
                      cx={CIRCLE_SIZE / 2}
                      cy={CIRCLE_SIZE / 2}
                      r={RADIUS}
                      stroke={seg.color}
                      strokeWidth={STROKE_WIDTH}
                      strokeDasharray={`${seg.length},${
                        CIRCUMFERENCE - seg.length
                      }`}
                      strokeDashoffset={-seg.offset}
                      strokeLinecap="round"
                      fill="none"
                    />
                  ))}
                  {/* White center mask */}
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={(CIRCLE_SIZE - STROKE_WIDTH * 1.7) / 2}
                    fill="#fff"
                  />
                </Svg>
                {/* Center label */}
                <View style={styles.chartCenter} pointerEvents="none">
                  <Text style={styles.chartCaloriesLabel}>Calories</Text>
                  <Text style={styles.chartCaloriesValue}>
                    ~{mealPlan.calories}
                  </Text>
                  <Text style={styles.chartCaloriesSub}>Daily energy goal</Text>
                </View>
              </View>
              {/* Macro Legend */}
              <View style={styles.macroLegendRow}>
                {macros.map((m: any) => (
                  <View style={styles.macroLegendItem} key={m.key}>
                    <View
                      style={[styles.macroDot, { backgroundColor: m.color }]}
                    />
                    <Text style={styles.macroLegendLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            {/* Meal Plan Example */}
            <Text style={styles.sectionTitle}>Meal plan example</Text>
            <Text style={styles.sectionDesc}>
              Our dietitian specialists prepared for you balanced meal plan for
              every day of your diet.
            </Text>
            {(() => {
              console.log("Rendering meals, count:", meals.length);
              return meals.map((meal: any, idx: number) => {
                console.log(`Rendering meal ${idx}:`, meal);
                return (
                  <TouchableOpacity
                    key={meal.title + idx}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedFood(meal);
                      setShowFoodDetails(true);
                    }}
                  >
                    <View style={styles.mealCard}>
                      <View style={styles.mealImagePlaceholder} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mealTitle}>{meal.title}</Text>
                        <View style={styles.mealMacrosRow}>
                          <View style={styles.mealMacroItemLabel}>
                            <View
                              style={[
                                styles.macroDot,
                                { backgroundColor: macros[0]?.color || "#000" },
                              ]}
                            />
                            <Text style={styles.mealMacroLabel}>Protein</Text>
                          </View>
                          <Text style={styles.mealMacroValue}>
                            {meal.protein || 0}
                          </Text>
                          <View style={styles.mealMacroItemLabel}>
                            <View
                              style={[
                                styles.macroDot,
                                { backgroundColor: macros[1]?.color || "#000" },
                              ]}
                            />
                            <Text style={styles.mealMacroLabel}>Fat</Text>
                          </View>
                          <Text style={styles.mealMacroValue}>
                            {meal.fat || 0}
                          </Text>
                          <View style={styles.mealMacroItemLabel}>
                            <View
                              style={[
                                styles.macroDot,
                                { backgroundColor: macros[2]?.color || "#000" },
                              ]}
                            />
                            <Text style={styles.mealMacroLabel}>Carbs</Text>
                          </View>
                          <Text style={styles.mealMacroValue}>
                            {meal.carbs || 0}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              });
            })()}
          </ScrollView>
          {/* Choose Plan Button */}
          <TouchableOpacity
            style={[styles.chooseBtn, isLoading && styles.chooseBtnDisabled]}
            onPress={handleChoosePress}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.chooseBtnText,
                isLoading && styles.chooseBtnTextDisabled,
              ]}
            >
              {isLoading ? "Selecting..." : "Choose this Plan"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Food Details Modal */}
      <FoodDetailsModal
        visible={showFoodDetails}
        onClose={() => setShowFoodDetails(false)}
        food={selectedFood}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 600,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#000000",
  },
  planDesc: {
    color: "#64748B",
    fontSize: 16,
    marginLeft: 18,
    marginRight: 18,
    marginBottom: 18,
  },
  macrosChart: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 24,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  macroLegendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  macroLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  macroLegendLabel: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1E293B",
    marginLeft: 18,
    marginTop: 18,
    marginBottom: 2,
  },
  sectionDesc: {
    color: "#A3A3A3",
    fontSize: 14,
    marginLeft: 18,
    marginRight: 18,
    marginBottom: 12,
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mealImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#CBD5E1",
    marginRight: 16,
  },
  mealTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  mealMacrosRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  mealMacroItemLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  mealMacroLabel: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },
  mealMacroValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginRight: 12,
  },
  chooseBtn: {
    backgroundColor: "#A78BFA",
    borderRadius: 12,
    margin: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  chooseBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  chartCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCaloriesLabel: {
    color: "#A3A3A3",
    fontSize: 14,
    fontWeight: "600",
  },
  chartCaloriesValue: {
    color: "#7C3AED",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 2,
  },
  chartCaloriesSub: {
    color: "#A3A3A3",
    fontSize: 12,
  },
  chooseBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  chooseBtnTextDisabled: {
    color: "#A3A3A3",
  },
});

export default MealPlanDetailsModal;
