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
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "./onboarding-context";

const helpOptions = [
  {
    id: "fitness",
    label: "Fitness",
    description: "Improve strength, endurance, and overall fitness",
    icon: "fitness",
    color: "#4CAF50",
  },
  {
    id: "weight_loss",
    label: "Weight Loss",
    description: "Lose weight in a healthy and sustainable way",
    icon: "trending-down",
    color: "#FF9800",
  },
  {
    id: "muscle_gain",
    label: "Muscle Gain",
    description: "Build muscle mass and increase strength",
    icon: "body",
    color: "#2196F3",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    description: "Learn about healthy eating and meal planning",
    icon: "restaurant",
    color: "#9C27B0",
  },
  {
    id: "flexibility",
    label: "Flexibility",
    description: "Improve mobility and reduce injury risk",
    icon: "body",
    color: "#00BCD4",
  },
  {
    id: "stress_management",
    label: "Stress Management",
    description: "Reduce stress through exercise and mindfulness",
    icon: "leaf",
    color: "#4CAF50",
  },
];

export default function SelectHelpScreen() {
  const { data, setHelpCategories } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(data.helpCategories);

  const toggleHelpOption = (helpId: string) => {
    setSelected((prev) =>
      prev.includes(helpId)
        ? prev.filter((id) => id !== helpId)
        : [...prev, helpId]
    );
  };

  const handleNext = () => {
    setHelpCategories(selected);
    router.push("/(onboarding)/done");
  };

  const handleSkip = () => {
    router.push("/(onboarding)/done");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "100%" }]} />
            </View>
            <Text style={styles.progressText}>Step 5 of 5</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>How can we help you?</Text>
        <Text style={styles.subtitle}>
          Select the areas where you'd like to receive guidance and support
        </Text>

        {/* Help Options */}
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {helpOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                selected.includes(option.id) && styles.selectedOption,
              ]}
              onPress={() => toggleHelpOption(option.id)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: option.color + "20" },
                  selected.includes(option.id) && {
                    backgroundColor: option.color,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={
                    selected.includes(option.id) ? "#fff" : option.color
                  }
                />
              </View>
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    selected.includes(option.id) && styles.selectedOptionLabel,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
              {selected.includes(option.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              selected.length === 0 && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={selected.length === 0}
          >
            <Text style={styles.nextButtonText}>Complete</Text>
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#A26FFD",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: "#fff",
    borderColor: "#A26FFD",
    shadowColor: "#A26FFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  selectedOptionLabel: {
    color: "#A26FFD",
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#A26FFD",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A26FFD",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
