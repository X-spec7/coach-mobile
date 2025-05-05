import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const { width: screenWidth } = Dimensions.get("window");

type HeightUnit = "cm" | "ft";

const feetOptions = Array.from({ length: 5 }, (_, i) => 3 + i); // 3-7 ft
const inchOptions = Array.from({ length: 12 }, (_, i) => i); // 0-11 in
const cmOptions = Array.from({ length: 61 }, (_, i) => 120 + i); // 120-180 cm

export default function HeightScreen() {
  const [unit, setUnit] = useState<HeightUnit>("ft");
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(3);
  const [cm, setCm] = useState(170);

  const handleContinue = () => {
    router.push("/(onboarding)/interests");
  };

  const handleSkip = () => {
    router.push("/(onboarding)/interests");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon Circle */}
        <View style={styles.iconContainer}>
          <Ionicons name="resize-outline" size={40} color="#A26FFD" />
        </View>

        <Text style={styles.stepText}>Step 6/9</Text>
        <Text style={styles.title}>What is your height?</Text>

        {/* Unit Toggle */}
        <View style={styles.unitContainer}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "cm" && styles.unitButtonActive,
            ]}
            onPress={() => setUnit("cm")}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === "cm" && styles.unitButtonTextActive,
              ]}
            >
              cm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "ft" && styles.unitButtonActive,
            ]}
            onPress={() => setUnit("ft")}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === "ft" && styles.unitButtonTextActive,
              ]}
            >
              ft
            </Text>
          </TouchableOpacity>
        </View>

        {/* Height Picker */}
        <View style={styles.pickerRow}>
          {unit === "ft" ? (
            <>
              <View style={styles.pickerColumn}>
                <Picker
                  selectedValue={feet.toString()}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  onValueChange={(itemValue: string) =>
                    setFeet(Number(itemValue))
                  }
                >
                  {feetOptions.map((f) => (
                    <Picker.Item
                      key={f}
                      label={`${f} ft`}
                      value={f.toString()}
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.pickerColumn}>
                <Picker
                  selectedValue={inches.toString()}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  onValueChange={(itemValue: string) =>
                    setInches(Number(itemValue))
                  }
                >
                  {inchOptions.map((inch) => (
                    <Picker.Item
                      key={inch}
                      label={`${inch} in`}
                      value={inch.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </>
          ) : (
            <View style={styles.pickerColumnFull}>
              <Picker
                selectedValue={cm.toString()}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue: string) => setCm(Number(itemValue))}
              >
                {cmOptions.map((c) => (
                  <Picker.Item key={c} label={`${c} cm`} value={c.toString()} />
                ))}
              </Picker>
            </View>
          )}
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, styles.continueButtonActive]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        <View style={styles.progressIndicator}>
          <View style={styles.progressDot} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
    borderRadius: 2,
  },
  progressFill: {
    width: "66.66%", // 6/9 of the total width
    height: "100%",
    backgroundColor: "#A26FFD",
    borderRadius: 2,
  },
  skipText: {
    color: "#666",
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#A26FFD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  stepText: {
    color: "#A26FFD",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  unitContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  unitButton: {
    borderWidth: 1,
    borderColor: "#A26FFD",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 24,
    marginHorizontal: 4,
    backgroundColor: "#fff",
  },
  unitButtonActive: {
    backgroundColor: "#F3EFFF",
    borderColor: "#A26FFD",
  },
  unitButtonText: {
    color: "#A26FFD",
    fontSize: 16,
    fontWeight: "500",
  },
  unitButtonTextActive: {
    color: "#A26FFD",
    fontWeight: "700",
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    gap: 32,
    width: "100%",
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
    minWidth: 100,
  },
  pickerColumnFull: {
    flex: 1,
    alignItems: "center",
    minWidth: 200,
  },
  picker: {
    width: "100%",
    height: 180,
    backgroundColor: "transparent",
  },
  pickerItem: {
    fontSize: 22,
    color: "#A26FFD",
    fontWeight: "600",
  },
  bottomContainer: {
    padding: 24,
  },
  continueButton: {
    backgroundColor: "#E0E0E0",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  continueButtonActive: {
    backgroundColor: "#A26FFD",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  progressIndicator: {
    alignItems: "center",
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000",
  },
});
