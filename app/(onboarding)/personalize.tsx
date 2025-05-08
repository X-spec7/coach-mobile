import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

export default function PersonalizeScreen() {
  const handlePersonalize = () => {
    // Navigate to the first step of personalization
    router.push("/(onboarding)/notifications");
  };

  const handleSetupLater = () => {
    // Navigate to the next screen after skipping
    router.push("/(tabs)");
  };

  return (
    <ImageBackground
      source={require("@/assets/images/personalise-bg.png")}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Purple Circle with Dumbbell Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="barbell" size={32} color="white" />
        </View>

        {/* Title and Description */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Personalized{"\n"}Fitness Training</Text>
          <Text style={styles.description}>
            A simple workout planner and tracker designed to help you stay
            healthy and fit with ease.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.personalizeButton}
            onPress={handlePersonalize}
          >
            <Text style={styles.personalizeButtonText}>
              Personalize Your Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.setupLaterButton}
            onPress={handleSetupLater}
          >
            <Text style={styles.setupLaterText}>Set Up Later</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#A26FFD",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 48,
    marginLeft: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 40,
    fontFamily: "Roboto",
    fontWeight: "700",
    color: "white",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: "Roboto",
    fontWeight: "400",
    color: "white",
    lineHeight: 24,
    opacity: 0.9,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  personalizeButton: {
    backgroundColor: "#A26FFD",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  personalizeButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Roboto",
    fontWeight: "600",
  },
  setupLaterButton: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  setupLaterText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Roboto",
    fontWeight: "400",
  },
  progressContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
});
