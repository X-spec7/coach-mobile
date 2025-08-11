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

const interestOptions = [
  { id: "strength_training", label: "Strength Training", icon: "fitness" },
  { id: "cardio", label: "Cardio", icon: "heart" },
  { id: "yoga", label: "Yoga", icon: "body" },
  { id: "pilates", label: "Pilates", icon: "body" },
  { id: "running", label: "Running", icon: "walk" },
  { id: "cycling", label: "Cycling", icon: "bicycle" },
  { id: "swimming", label: "Swimming", icon: "water" },
  { id: "boxing", label: "Boxing", icon: "hand" },
  { id: "dance", label: "Dance", icon: "musical-notes" },
  { id: "martial_arts", label: "Martial Arts", icon: "shield" },
  { id: "crossfit", label: "CrossFit", icon: "fitness" },
  { id: "meditation", label: "Meditation", icon: "leaf" },
];

export default function InterestsScreen() {
  const { data, setInterests } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(data.interests);

  const toggleInterest = (interestId: string) => {
    setSelected((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    setInterests(selected);
    router.push("/(onboarding)/select-help");
  };

  const handleSkip = () => {
    router.push("/(onboarding)/select-help");
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
              <View style={[styles.progressFill, { width: "80%" }]} />
            </View>
            <Text style={styles.progressText}>Step 4 of 5</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>What are your interests?</Text>
        <Text style={styles.subtitle}>
          Select all that apply to help us personalize your experience
        </Text>

        {/* Interests Grid */}
        <ScrollView style={styles.interestsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.interestsGrid}>
            {interestOptions.map((interest) => (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.interestItem,
                  selected.includes(interest.id) && styles.selectedInterest,
                ]}
                onPress={() => toggleInterest(interest.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    selected.includes(interest.id) && styles.selectedIconContainer,
                  ]}
                >
                  <Ionicons
                    name={interest.icon as any}
                    size={24}
                    color={
                      selected.includes(interest.id) ? "#fff" : "#A26FFD"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.interestLabel,
                    selected.includes(interest.id) && styles.selectedInterestLabel,
                  ]}
                >
                  {interest.label}
                </Text>
                {selected.includes(interest.id) && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
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
    marginBottom: 30,
    lineHeight: 24,
  },
  interestsContainer: {
    flex: 1,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  interestItem: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  selectedInterest: {
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
    backgroundColor: "#A26FFD20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  selectedIconContainer: {
    backgroundColor: "#A26FFD",
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  selectedInterestLabel: {
    color: "#A26FFD",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
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
