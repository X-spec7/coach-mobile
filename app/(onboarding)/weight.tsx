import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type WeightUnit = "kg" | "lbs";

export default function WeightScreen() {
  const [weight, setWeight] = useState("145");
  const [unit, setUnit] = useState<WeightUnit>("lbs");

  const handleContinue = () => {
    router.push("/(onboarding)/height");
  };

  const handleSkip = () => {
    router.push("/(onboarding)/height");
  };

  const handleBack = () => {
    router.back();
  };

  const toggleUnit = (newUnit: WeightUnit) => {
    if (newUnit !== unit) {
      setUnit(newUnit);
      if (weight) {
        // Convert weight when changing units
        const numWeight = parseFloat(weight);
        if (!isNaN(numWeight)) {
          const convertedWeight =
            unit === "kg"
              ? (numWeight * 2.20462).toFixed(0) // kg to lbs
              : (numWeight / 2.20462).toFixed(0); // lbs to kg
          setWeight(convertedWeight);
        }
      }
    }
  };

  const handleWeightChange = (value: string) => {
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setWeight(value);
    }
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
        {/* Scale Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="scale" size={32} color="#A26FFD" />
        </View>

        <Text style={styles.stepText}>Step 5/9</Text>
        <Text style={styles.title}>What is your weight?</Text>

        {/* Unit Toggle */}
        <View style={styles.unitContainer}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "kg" && styles.unitButtonActive,
            ]}
            onPress={() => toggleUnit("kg")}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === "kg" && styles.unitButtonTextActive,
              ]}
            >
              kg
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "lbs" && styles.unitButtonActive,
            ]}
            onPress={() => toggleUnit("lbs")}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === "lbs" && styles.unitButtonTextActive,
              ]}
            >
              lbs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weight Display */}
        <View style={styles.weightDisplay}>
          <Text style={styles.weightText}>{weight}</Text>
          <Text style={styles.weightUnit}>{unit}</Text>
        </View>

        {/* Weight Scale */}
        <View style={styles.scaleContainer}>
          <View style={styles.scaleLines}>
            {[...Array(21)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.scaleLine,
                  index % 5 === 0 && styles.scaleLineLarge,
                ]}
              />
            ))}
          </View>
          <View style={styles.scaleMarkers}>
            <Text style={styles.scaleNumber}>140</Text>
            <View style={styles.scaleIndicator} />
            <Text style={styles.scaleNumber}>150</Text>
          </View>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            weight !== "" && styles.continueButtonActive,
          ]}
          onPress={handleContinue}
          disabled={weight === ""}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Progress Indicator */}
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
    width: "55.55%", // 5/9 of the total width
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(162, 111, 253, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  stepText: {
    color: "#A26FFD",
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 32,
  },
  unitContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  unitButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  unitButtonActive: {
    backgroundColor: "#A26FFD",
  },
  unitButtonText: {
    fontSize: 16,
    color: "#666",
  },
  unitButtonTextActive: {
    color: "white",
  },
  weightDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 40,
  },
  weightText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#000",
  },
  weightUnit: {
    fontSize: 20,
    color: "#666",
    marginLeft: 8,
  },
  scaleContainer: {
    width: "100%",
    alignItems: "center",
  },
  scaleLines: {
    width: "100%",
    height: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  scaleLine: {
    width: 1,
    height: 12,
    backgroundColor: "#E0E0E0",
  },
  scaleLineLarge: {
    height: 20,
  },
  scaleMarkers: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  scaleNumber: {
    fontSize: 14,
    color: "#666",
  },
  scaleIndicator: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFA726",
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
