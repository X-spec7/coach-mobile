import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Food } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

interface ChangeFoodModalProps {
  visible: boolean;
  foods: Food[];
  suitableFoods: Food[];
  onClose: () => void;
  onSave: (food: Food) => void;
}

export const ChangeFoodModal: React.FC<ChangeFoodModalProps> = ({
  visible,
  foods = [],
  suitableFoods = [],
  onClose,
  onSave,
}) => {
  if (!foods || foods.length === 0) return null;

  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const currentFood = foods[0];

  const handleSelect = (food: Food) => {
    setSelectedFood(food);
  };

  const handleSave = () => {
    if (selectedFood) {
      onSave(selectedFood);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Change Foods</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Current Food */}
            <Text style={styles.sectionTitle}>Current food</Text>
            <View
              style={[
                styles.foodCard,
                selectedFood === null && styles.selectedCard,
              ]}
            >
              <View style={styles.foodImage} />
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{currentFood.name}</Text>
                <View style={styles.macrosRow}>
                  <Text style={[styles.macro, { color: "#A78BFA" }]}>
                    Protein
                  </Text>
                  <Text style={[styles.macro, { color: "#F472B6" }]}>Fat</Text>
                  <Text style={[styles.macro, { color: "#FBBF24" }]}>
                    Carbs
                  </Text>
                </View>
                <View style={styles.macrosRow}>
                  <Text style={styles.macroValue}>
                    {currentFood.protein !== undefined
                      ? currentFood.protein
                      : "--"}
                  </Text>
                  <Text style={styles.macroValue}>
                    {currentFood.fat !== undefined ? currentFood.fat : "--"}
                  </Text>
                  <Text style={styles.macroValue}>
                    {currentFood.carbs !== undefined ? currentFood.carbs : "--"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={
                  selectedFood === null ? "checkmark-circle" : "ellipse-outline"
                }
                size={28}
                color={selectedFood === null ? "#A78BFA" : "#E5E7EB"}
                style={{ marginLeft: 8 }}
              />
            </View>

            {/* Suitable Foods */}
            <Text style={styles.sectionTitle}>Suitable foods</Text>
            {suitableFoods && suitableFoods.length > 0 ? (
              suitableFoods.map((food, idx) => (
                <TouchableOpacity
                  key={food.name + idx}
                  style={[
                    styles.foodCard,
                    selectedFood === food && styles.selectedCard,
                  ]}
                  onPress={() => handleSelect(food)}
                  activeOpacity={0.8}
                >
                  <View style={styles.foodImage} />
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <View style={styles.macrosRow}>
                      <Text style={[styles.macro, { color: "#A78BFA" }]}>
                        Protein
                      </Text>
                      <Text style={[styles.macro, { color: "#F472B6" }]}>
                        Fat
                      </Text>
                      <Text style={[styles.macro, { color: "#FBBF24" }]}>
                        Carbs
                      </Text>
                    </View>
                    <View style={styles.macrosRow}>
                      <Text style={styles.macroValue}>
                        {food.protein !== undefined ? food.protein : "--"}
                      </Text>
                      <Text style={styles.macroValue}>
                        {food.fat !== undefined ? food.fat : "--"}
                      </Text>
                      <Text style={styles.macroValue}>
                        {food.carbs !== undefined ? food.carbs : "--"}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={
                      selectedFood === food
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={28}
                    color={selectedFood === food ? "#A78BFA" : "#E5E7EB"}
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noFoodsText}>
                No suitable foods available
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 12,
    paddingHorizontal: 18,
    minHeight: 500,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backText: {
    color: "#94A3B8",
    fontSize: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  saveText: {
    color: "#A78BFA",
    fontSize: 18,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 24,
    marginBottom: 10,
  },
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#A78BFA",
    backgroundColor: "#fff",
  },
  foodImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E5E7EB",
    marginRight: 18,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 6,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  macro: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginRight: 8,
  },
  noFoodsText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 16,
    marginTop: 20,
  },
});

export default ChangeFoodModal;
