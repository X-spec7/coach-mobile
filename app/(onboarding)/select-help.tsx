import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useOnboarding } from "./onboarding-context";

const HELP_OPTIONS = [
  {
    key: "nutrition",
    icon: <Ionicons name="restaurant" size={28} color="#A26FFD" />,
    label: "Option 1 – es. Nutrition",
    description: "Description section",
  },
  {
    key: "weight",
    icon: <FontAwesome5 name="weight" size={28} color="#A26FFD" />,
    label: "Option 2 – es. Weight",
    description: "Description section",
  },
  {
    key: "sleep",
    icon: <Ionicons name="bed-outline" size={28} color="#A26FFD" />,
    label: "Option 3 – es. Sleep",
    description: "Sleep section",
  },
  {
    key: "workout",
    icon: <FontAwesome5 name="dumbbell" size={28} color="#A26FFD" />,
    label: "Option 4 – es. Workout",
    description: "Workout - Description",
  },
];

export default function SelectHelpScreen() {
  const { data, setHelpOption } = useOnboarding();
  const [selected, setSelected] = useState<string>(data.helpOption);

  const handleContinue = () => {
    setHelpOption(selected);
    router.push("/(onboarding)/experience");
  };

  const handleSkip = () => {
    router.push("/(onboarding)/experience");
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
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainerScroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepText}>Step 8/9</Text>
        <Text style={styles.title}>Let us know how we{"\n"}can help you</Text>
        <Text style={styles.subtitle}>You always can change this</Text>

        <View style={styles.optionsList}>
          {HELP_OPTIONS.map((option) => {
            const isSelected = selected === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionItem,
                  isSelected && styles.optionItemSelected,
                ]}
                onPress={() => setSelected(option.key)}
                activeOpacity={0.8}
              >
                <View style={styles.optionIcon}>{option.icon}</View>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <View style={styles.optionRadioContainer}>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#4ADE80"
                    />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={24}
                      color="#A26FFD"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selected && styles.continueButtonActive,
          ]}
          onPress={handleContinue}
          disabled={!selected}
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
    width: "88.88%", // 8/9 of the total width
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
  },
  contentContainerScroll: {
    paddingBottom: 32,
  },
  stepText: {
    color: "#A26FFD",
    fontSize: 16,
    marginBottom: 8,
    alignSelf: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  optionsList: {
    gap: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  optionItemSelected: {
    borderColor: "#A26FFD",
    backgroundColor: "#F3EFFF",
    shadowColor: "#A26FFD",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  optionIcon: {
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: "#A26FFD",
  },
  optionDescription: {
    fontSize: 14,
    color: "#888",
  },
  optionRadioContainer: {
    marginLeft: 12,
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
