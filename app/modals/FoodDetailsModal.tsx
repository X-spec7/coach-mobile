import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FoodDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  food: {
    name: string;
    protein: number;
    fat: number;
    carbs: number;
    materials: { name: string; amount: string }[];
    steps: string[];
  } | null;
}

const macroColors = {
  protein: "#A78BFA",
  fat: "#F87171",
  carbs: "#FBBF24",
};

export const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({
  visible,
  onClose,
  food,
}) => {
  if (!food) return null;
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
            <Text style={styles.headerTitle}>Food Details</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Food Name & Macros */}
            <Text style={styles.foodName}>{food.name}</Text>
            <View style={styles.macrosRow}>
              <View style={styles.macroCol}>
                <View
                  style={[
                    styles.macroDot,
                    { backgroundColor: macroColors.protein },
                  ]}
                />
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{food.protein}</Text>
              </View>
              <View style={styles.macroCol}>
                <View
                  style={[
                    styles.macroDot,
                    { backgroundColor: macroColors.fat },
                  ]}
                />
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>{food.fat}</Text>
              </View>
              <View style={styles.macroCol}>
                <View
                  style={[
                    styles.macroDot,
                    { backgroundColor: macroColors.carbs },
                  ]}
                />
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>{food.carbs}</Text>
              </View>
            </View>
            {/* Material List */}
            <Text style={styles.sectionTitle}>Material</Text>
            {food.materials.map((mat, idx) => (
              <View style={styles.materialRow} key={mat.name + idx}>
                <Text style={styles.materialName}>{mat.name}</Text>
                <Text style={styles.materialAmount}>{mat.amount}</Text>
              </View>
            ))}
            {/* Perform Steps */}
            <Text style={styles.sectionTitle}>Perform</Text>
            {food.steps.map((step, idx) => (
              <View style={styles.stepRow} key={idx}>
                <View style={styles.bullet} />
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
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
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 400,
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
  foodName: {
    fontWeight: "bold",
    fontSize: 28,
    color: "#1E293B",
    marginLeft: 18,
    marginTop: 18,
    marginBottom: 8,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 18,
  },
  macroCol: {
    alignItems: "center",
    flex: 1,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  macroLabel: {
    color: "#A3A3A3",
    fontSize: 15,
    fontWeight: "bold",
  },
  macroValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 2,
    marginBottom: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1E293B",
    marginLeft: 18,
    marginTop: 18,
    marginBottom: 8,
  },
  materialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  materialName: {
    fontSize: 16,
    color: "#1E293B",
  },
  materialAmount: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 18,
    marginBottom: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A78BFA",
    marginTop: 8,
    marginRight: 10,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    marginBottom: 2,
  },
});

export default FoodDetailsModal;
