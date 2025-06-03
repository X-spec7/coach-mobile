import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";

interface SetMacrosModalProps {
  visible: boolean;
  initialValues?: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
  onClose: () => void;
  onSave: (values: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  }) => void;
}

export const SetMacrosModal: React.FC<SetMacrosModalProps> = ({
  visible,
  initialValues = { calories: 2904, carbs: 276, protein: 126, fat: 142 },
  onClose,
  onSave,
}) => {
  const [calories, setCalories] = useState(initialValues.calories.toString());
  const [carbs, setCarbs] = useState(initialValues.carbs.toString());
  const [protein, setProtein] = useState(initialValues.protein.toString());
  const [fat, setFat] = useState(initialValues.fat.toString());

  const handleSave = () => {
    onSave({
      calories: parseInt(calories) || 0,
      carbs: parseInt(carbs) || 0,
      protein: parseInt(protein) || 0,
      fat: parseInt(fat) || 0,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
        enabled
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.headerBack}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Set Macros</Text>
            <TouchableOpacity
              onPress={handleSave}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.headerSave}>Save</Text>
            </TouchableOpacity>
          </View>
          {/* Fields */}
          <View style={styles.fieldsWrap}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Calories (kCal)</Text>
              <TextInput
                style={styles.fieldInput}
                value={calories}
                onChangeText={setCalories}
                keyboardType="number-pad"
                maxLength={5}
                returnKeyType="done"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Net Carbs (g)</Text>
              <TextInput
                style={styles.fieldInput}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="done"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Protein (g)</Text>
              <TextInput
                style={styles.fieldInput}
                value={protein}
                onChangeText={setProtein}
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="done"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Fat (g)</Text>
              <TextInput
                style={styles.fieldInput}
                value={fat}
                onChangeText={setFat}
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="done"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 400,
    paddingBottom: 0,
    paddingTop: 0,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    backgroundColor: "#F8FAFC",
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
  headerSave: {
    color: "#A78BFA",
    fontWeight: "bold",
    fontSize: 16,
  },
  fieldsWrap: {
    marginTop: 12,
    paddingHorizontal: 18,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
  },
  fieldLabel: {
    color: "#A3A3A3",
    fontSize: 16,
    fontWeight: "500",
  },
  fieldInput: {
    color: "#1E293B",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "right",
    minWidth: 60,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: -18,
  },
});
