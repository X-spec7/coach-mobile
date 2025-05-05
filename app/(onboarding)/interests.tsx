import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "./onboarding-context";

const INTERESTS = [
  { key: "vegan", label: "Vegan", image: require("@/assets/images/vegan.png") },
  {
    key: "sports",
    label: "Sports",
    image: require("@/assets/images/sports.png"),
  },
  {
    key: "running",
    label: "Running",
    image: require("@/assets/images/running.png"),
  },
  {
    key: "nurition",
    label: "Nutrition",
    image: require("@/assets/images/nurition.png"),
  },
  {
    key: "meditation",
    label: "Meditation",
    image: require("@/assets/images/meditation.png"),
  },
  {
    key: "organic",
    label: "Organic",
    image: require("@/assets/images/organic.png"),
  },
  { key: "dance", label: "Dance", image: require("@/assets/images/dance.png") },
  {
    key: "workout",
    label: "Workout",
    image: require("@/assets/images/workout.png"),
  },
  {
    key: "bodybuilding",
    label: "Bodybuilding",
    image: require("@/assets/images/bodybuilding.png"),
  },
];

export default function InterestsScreen() {
  const { data, setInterests } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(data.interests);

  const handleToggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleContinue = () => {
    setInterests(selected);
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
      <View style={styles.content}>
        <Text style={styles.stepText}>Step 7/9</Text>
        <Text style={styles.title}>Customize your interests</Text>
        <Text style={styles.subtitle}>What are you interested in?</Text>

        <View style={styles.grid}>
          {INTERESTS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.gridItem}
              onPress={() => handleToggle(item.key)}
              activeOpacity={0.8}
            >
              <Image source={item.image} style={styles.gridImage} />
              {selected.includes(item.key) ? (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </View>
              ) : (
                <View style={styles.uncheckedCircle} />
              )}
              <Text style={styles.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selected.length > 0 && styles.continueButtonActive,
          ]}
          onPress={handleContinue}
          disabled={selected.length === 0}
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
    width: "77.77%", // 7/9 of the total width
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  gridItem: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "70%",
    resizeMode: "cover",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  checkCircle: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    borderWidth: 2,
    borderColor: "#fff",
  },
  uncheckedCircle: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    zIndex: 2,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginTop: 4,
    textAlign: "center",
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
