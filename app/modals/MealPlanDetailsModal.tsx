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

interface Macro {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface Meal {
  title: string;
  protein: number;
  fat: number;
  carbs: number;
}

interface MealPlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: {
    category: string;
    name: string;
    description: string;
    calories: number;
    macros: Macro[];
    meals: Meal[];
  } | null;
  onChoose: () => void;
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
}) => {
  if (!plan) return null;
  // Calculate circle segments for macros
  const total = plan.macros.reduce((sum, m) => sum + m.value, 0);
  let startAngle = 0;
  const macroSegments = plan.macros.map((macro) => {
    const percent = macro.value / total;
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

  // Example food details (should be replaced with real data)
  const getFoodDetails = (meal: any) => ({
    name: meal.title,
    protein: meal.protein,
    fat: meal.fat,
    carbs: meal.carbs,
    materials: [
      { name: "Corn", amount: "150g" },
      { name: "Sweet Potato", amount: "150g" },
      { name: "Carrot", amount: "150g" },
      { name: "Cauliflower", amount: "150g" },
    ],
    steps: [
      "Add enough salted water to cover.",
      "Place lid on saucepan, bring to the boil as quickly as possible.",
      "Place vegetables in a saucepan.",
      "Reduce heat and simmer gently until tender when tested with a skewer, point of knife or fork.",
      "Always simmer vegetables as vigorous boiling will cause some vegetables to break up.",
    ],
  });

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
            <Text style={styles.headerTitle}>{plan.name}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Plan Category */}
            <Text style={styles.planCategory}>{plan.category}</Text>
            {/* Plan Name */}
            <Text style={styles.planName}>{plan.name}</Text>
            {/* Plan Description */}
            <Text style={styles.planDesc}>{plan.description}</Text>
            {/* Macros Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartWrap}>
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
                  {macroSegments.map((seg, idx) => (
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
                <View style={styles.chartCenter}>
                  <Text style={styles.chartCaloriesLabel}>Calories</Text>
                  <Text style={styles.chartCaloriesValue}>
                    ~{plan.calories}
                  </Text>
                  <Text style={styles.chartCaloriesSub}>Daily energy goal</Text>
                </View>
              </View>
              {/* Macro Legend */}
              <View style={styles.macroLegendRow}>
                {plan.macros.map((m) => (
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
            {plan.meals.map((meal, idx) => (
              <TouchableOpacity
                key={meal.title + idx}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedFood(getFoodDetails(meal));
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
                            { backgroundColor: plan.macros[0].color },
                          ]}
                        />
                        <Text style={styles.mealMacroLabel}>Protein</Text>
                      </View>
                      <Text style={styles.mealMacroValue}>{meal.protein}</Text>
                      <View style={styles.mealMacroItemLabel}>
                        <View
                          style={[
                            styles.macroDot,
                            { backgroundColor: plan.macros[1].color },
                          ]}
                        />
                        <Text style={styles.mealMacroLabel}>Fat</Text>
                      </View>
                      <Text style={styles.mealMacroValue}>{meal.fat}</Text>
                      <View style={styles.mealMacroItemLabel}>
                        <View
                          style={[
                            styles.macroDot,
                            { backgroundColor: plan.macros[2].color },
                          ]}
                        />
                        <Text style={styles.mealMacroLabel}>Carbs</Text>
                      </View>
                      <Text style={styles.mealMacroValue}>{meal.carbs}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Choose Plan Button */}
          <TouchableOpacity style={styles.chooseBtn} onPress={onChoose}>
            <Text style={styles.chooseBtnText}>Choose this Plan</Text>
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
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#1E293B",
  },
  planCategory: {
    color: "#A78BFA",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 18,
    marginTop: 18,
    marginBottom: 2,
  },
  planName: {
    fontWeight: "bold",
    fontSize: 28,
    color: "#1E293B",
    marginLeft: 18,
    marginBottom: 4,
  },
  planDesc: {
    color: "#64748B",
    fontSize: 16,
    marginLeft: 18,
    marginRight: 18,
    marginBottom: 18,
  },
  chartCard: {
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
  chartWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  chartCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  chartCaloriesLabel: {
    color: "#A3A3A3",
    fontSize: 16,
    fontWeight: "500",
  },
  chartCaloriesValue: {
    color: "#1E293B",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 2,
    marginBottom: 2,
  },
  chartCaloriesSub: {
    color: "#A3A3A3",
    fontSize: 14,
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
});

export default MealPlanDetailsModal;
