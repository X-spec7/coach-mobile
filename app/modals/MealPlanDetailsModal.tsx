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
import { MealPlanDetails } from "../services/api";

interface MealPlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: MealPlanDetails | null;
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
            {/* Plan Description */}
            <Text style={styles.planDesc}>{plan.description}</Text>
            {/* Macros Chart */}
            <View style={styles.macrosChart}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                {macroSegments.map((segment, index) => (
                  <Circle
                    key={index}
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    stroke={segment.color}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={`${segment.length} ${CIRCUMFERENCE}`}
                    strokeDashoffset={segment.offset}
                    fill="none"
                    transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${
                      CIRCLE_SIZE / 2
                    })`}
                  />
                ))}
              </Svg>
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
});

export default MealPlanDetailsModal;
