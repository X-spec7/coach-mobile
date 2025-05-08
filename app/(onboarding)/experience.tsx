import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

const STAR_LEVELS = [
  {
    stars: 1,
    title: "Just Starting",
    description: "I am new to fitness or returning after a long break.",
  },
  {
    stars: 2,
    title: "Getting There",
    description: "I have some experience but still consider myself a beginner.",
  },
  {
    stars: 3,
    title: "Intermediate",
    description: "I exercise regularly and have moderate experience.",
  },
  {
    stars: 4,
    title: "Advanced",
    description: "I am experienced and looking for a challenge.",
  },
  {
    stars: 5,
    title: "Expert",
    description: "I am highly experienced and want to push my limits.",
  },
];

export default function ExperienceScreen() {
  const [selectedStars, setSelectedStars] = useState<number>(0);

  const handleContinue = () => {
    if (selectedStars > 0) {
      router.push("/(onboarding)/done");
    }
  };

  const currentLevel = STAR_LEVELS[selectedStars - 1];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your fitness level?</Text>
        <Text style={styles.subtitle}>
          This helps us create your perfect program
        </Text>

        {/* Star Rating */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setSelectedStars(star)}
              activeOpacity={0.7}
            >
              <FontAwesome
                name={star <= selectedStars ? "star" : "star-o"}
                size={40}
                color={star <= selectedStars ? "#A26FFD" : "#E0E0E0"}
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Title & Description */}
        {selectedStars > 0 && (
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{currentLevel.title}</Text>
            <Text style={styles.levelDescription}>
              {currentLevel.description}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, selectedStars === 0 && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={selectedStars === 0}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
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
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  },
  starIcon: {
    marginHorizontal: 4,
  },
  levelInfo: {
    alignItems: "center",
    marginTop: 16,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#A26FFD",
    marginBottom: 8,
    textAlign: "center",
  },
  levelDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    backgroundColor: "#A26FFD",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#d1d1d1",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
