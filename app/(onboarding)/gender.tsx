import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding, Gender } from "./onboarding-context";

const genderOptions = [
  {
    type: "male" as Gender,
    label: "Male",
    icon: "male",
    color: "#4A90E2",
  },
  {
    type: "female" as Gender,
    label: "Female",
    icon: "female",
    color: "#E91E63",
  },
  {
    type: "not_specified" as Gender,
    label: "Prefer not to say",
    icon: "person",
    color: "#9E9E9E",
  },
];

export default function GenderScreen() {
  const { data, setGender } = useOnboarding();
  const [selectedGender, setSelectedGender] = useState<Gender>(data.gender);

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
    setGender(gender);
  };

  const handleNext = () => {
    router.push("/(onboarding)/weight");
  };

  const handleSkip = () => {
    setGender("not_specified");
    router.push("/(onboarding)/weight");
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
              <View style={[styles.progressFill, { width: "60%" }]} />
            </View>
            <Text style={styles.progressText}>Step 3 of 5</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>What's your gender?</Text>
        <Text style={styles.subtitle}>
          This helps us personalize your experience
        </Text>

        {/* Gender Options */}
        <View style={styles.optionsContainer}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.option,
                selectedGender === option.type && styles.selectedOption,
              ]}
              onPress={() => handleGenderSelect(option.type)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: option.color + "20" },
                  selectedGender === option.type && {
                    backgroundColor: option.color,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={32}
                  color={
                    selectedGender === option.type ? "#fff" : option.color
                  }
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  selectedGender === option.type && styles.selectedOptionLabel,
                ]}
              >
                {option.label}
              </Text>
              {selectedGender === option.type && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedGender === "not_specified" && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={selectedGender === "not_specified"}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    marginBottom: 40,
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    marginBottom: 16,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  selectedOptionLabel: {
    color: "#A26FFD",
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
