import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";

interface SetMacrosModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  }) => void;
  isLoading?: boolean;
  error?: string | null;
  initialValues?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

export const SetMacrosModal: React.FC<SetMacrosModalProps> = ({
  visible,
  onClose,
  onSave,
  isLoading = false,
  error = null,
  initialValues = { calories: 0, carbs: 0, protein: 0, fat: 0 },
}) => {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleSave = () => {
    onSave(values);
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
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Text style={[styles.backText, isLoading && styles.disabledText]}>
                Back
              </Text>
            </TouchableOpacity>
            <Text style={styles.title}>Set Macros</Text>
            <TouchableOpacity onPress={handleSave} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#A78BFA" />
              ) : (
                <Text
                  style={[styles.saveText, isLoading && styles.disabledText]}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.content}>
            <View style={styles.fieldsWrap}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Calories (kCal)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={values.calories.toString()}
                  onChangeText={(text) =>
                    setValues({ ...values, calories: parseInt(text) || 0 })
                  }
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
                  value={values.carbs.toString()}
                  onChangeText={(text) =>
                    setValues({ ...values, carbs: parseInt(text) || 0 })
                  }
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
                  value={values.protein.toString()}
                  onChangeText={(text) =>
                    setValues({ ...values, protein: parseInt(text) || 0 })
                  }
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
                  value={values.fat.toString()}
                  onChangeText={(text) =>
                    setValues({ ...values, fat: parseInt(text) || 0 })
                  }
                  keyboardType="number-pad"
                  maxLength={4}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
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
  disabledText: {
    opacity: 0.5,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  content: {
    paddingVertical: 24,
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
