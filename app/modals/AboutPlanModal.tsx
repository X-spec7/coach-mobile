import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import ChangePlanModal from "./ChangePlanModal";
import { MealPlan } from "../services/api";

interface AboutPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onChange?: () => void;
  selectedMeal: MealPlan;
}

const PLAN_IMAGE = require("../../assets/images/plan-placeholder.png"); // Placeholder image
const CIRCLE_SIZE = 180;
const STROKE_WIDTH = 16;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MEALS = [
  {
    title: "Fresh Vegetable Salad",
    protein: 530,
    fat: 103,
    carbs: 250,
  },
  {
    title: "Pan-fried Salmon",
    protein: 530,
    fat: 103,
    carbs: 250,
  },
  {
    title: "Fish with Pepper",
    protein: 530,
    fat: 103,
    carbs: 250,
  },
];

export const AboutPlanModal: React.FC<AboutPlanModalProps> = ({
  visible,
  selectedMeal,
  onClose,
  onChange,
}) => {
  const TOTAL =
    (selectedMeal?.protein ?? 0) +
    (selectedMeal?.fat ?? 0) +
    (selectedMeal?.carbs ?? 0);
  const MACROS = [
    {
      key: "protein",
      label: "Protein",
      value: selectedMeal?.protein || 0,
      color: "#7C3AED",
    },
    {
      key: "fat",
      label: "Fat",
      value: selectedMeal?.fat || 0,
      color: "#F87171",
    },
    {
      key: "carbs",
      label: "Carbs",
      value: selectedMeal?.carbs || 0,
      color: "#FBBF24",
    },
  ];
  // Calculate circle segments for macros
  let startAngle = 0;
  const macroSegments = MACROS.map((macro) => {
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

  // State for ChangePlanModal
  const [showChangePlan, setShowChangePlan] = React.useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.headerBack}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>About Your Plan</Text>
            <TouchableOpacity
              onPress={() => setShowChangePlan(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.headerChange}>Change</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Plan Image */}
            <View style={styles.planImageWrap}>
              <View style={styles.planImagePlaceholder} />
            </View>
            {/* Plan Info */}
            <Text style={styles.planSubtitle}>Traditional diets</Text>
            <Text style={styles.planName}>Mediterranean</Text>
            <Text style={styles.planDesc}>{selectedMeal?.description}</Text>
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
                    ~{selectedMeal?.calories}
                  </Text>
                  <Text style={styles.chartCaloriesSub}>Daily energy goal</Text>
                </View>
              </View>
              {/* Macro Legend */}
              <View style={styles.macroLegendRow}>
                {MACROS.map((m) => (
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
            {selectedMeal?.meal_times?.map((mealTime, mtIdx) =>
              mealTime.mealplan_food_items.map((food, idx) => (
                <View style={styles.mealCard} key={food.name + mtIdx + idx}>
                  <View style={styles.mealImagePlaceholder} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealTitle}>{food.name}</Text>
                    <View style={styles.mealMacrosRow}>
                      <View style={styles.mealMacroItem}>
                        <View style={styles.mealMacroItemLabel}>
                          <View
                            style={[
                              styles.macroDot,
                              { backgroundColor: MACROS[0].color },
                            ]}
                          />
                          <Text style={styles.mealMacroLabel}>Protein</Text>
                        </View>
                        <Text style={styles.mealMacroValue}>
                          {food.protein ?? 0}
                        </Text>
                      </View>
                      <View style={styles.mealMacroItem}>
                        <View style={styles.mealMacroItemLabel}>
                          <View
                            style={[
                              styles.macroDot,
                              { backgroundColor: MACROS[1].color },
                            ]}
                          />
                          <Text style={styles.mealMacroLabel}>Fat</Text>
                        </View>
                        <Text style={styles.mealMacroValue}>
                          {food.fat ?? 0}
                        </Text>
                      </View>
                      <View style={styles.mealMacroItem}>
                        <View style={styles.mealMacroItemLabel}>
                          <View
                            style={[
                              styles.macroDot,
                              { backgroundColor: MACROS[2].color },
                            ]}
                          />
                          <Text style={styles.mealMacroLabel}>Carbs</Text>
                        </View>
                        <Text style={styles.mealMacroValue}>
                          {food.carbs ?? 0}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
      {/* Change Plan Modal */}
      <ChangePlanModal
        visible={showChangePlan}
        onClose={() => setShowChangePlan(false)}
        onSave={() => setShowChangePlan(false)}
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
  headerBack: {
    color: "#A3A3A3",
    fontSize: 16,
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1E293B",
  },
  headerChange: {
    color: "#A78BFA",
    fontWeight: "bold",
    fontSize: 16,
  },
  planImageWrap: {
    width: "100%",
    height: 120,
    backgroundColor: "#CBD5E1",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginBottom: 18,
  },
  planImagePlaceholder: {
    flex: 1,
    backgroundColor: "#CBD5E1",
    borderRadius: 12,
  },
  planSubtitle: {
    color: "#A78BFA",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 18,
    marginBottom: 2,
  },
  planName: {
    fontWeight: "bold",
    fontSize: 24,
    color: "#1E293B",
    marginLeft: 18,
    marginBottom: 4,
  },
  planDesc: {
    color: "#64748B",
    fontSize: 15,
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
    shadowColor: "#fff",
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
  mealMacroItemLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealMacroItem: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
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
    marginLeft: 4,
  },
});
