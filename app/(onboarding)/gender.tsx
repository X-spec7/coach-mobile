import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "./onboarding-context";

type Gender = "male" | "female" | null;

interface GenderOption {
  type: Gender;
  title: string;
  subtitle: string;
  image: any;
}

const genderOptions: GenderOption[] = [
  {
    type: "female",
    title: "Female",
    subtitle: "I'm beautiful",
    image: require("@/assets/images/female.png"),
  },
  {
    type: "male",
    title: "Male",
    subtitle: "I'm handsome",
    image: require("@/assets/images/male.png"),
  },
];

export default function GenderScreen() {
  const { data, setGender } = useOnboarding();

  const handleContinue = () => {
    router.push("/(onboarding)/weight");
  };

  const handleSkip = () => {
    router.push("/(onboarding)/weight");
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
        <Text style={styles.stepText}>Step 4/9</Text>
        <Text style={styles.title}>Which one are you?</Text>

        {/* Gender Selection */}
        <View style={styles.genderContainer}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={styles.genderOption}
              onPress={() => setGender(option.type)}
            >
              <ImageBackground
                source={option.image}
                style={styles.genderImage}
                imageStyle={styles.genderImageStyle}
              >
                <View style={styles.genderOverlay}>
                  {data.gender === option.type && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#A26FFD"
                      />
                    </View>
                  )}
                  <View style={styles.genderTextContainer}>
                    <Text style={styles.genderTitle}>{option.title}</Text>
                    <Text style={styles.genderSubtitle}>{option.subtitle}</Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.descriptionText}>
          To give you a customize experience we need to need to know your gender
        </Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        {/* Prefer not to choose button */}
        <TouchableOpacity
          style={styles.preferNotButton}
          onPress={() => setGender(null)}
        >
          <Text style={styles.preferNotText}>Prefer not to choose</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            data.gender && styles.continueButtonActive,
          ]}
          onPress={handleContinue}
          disabled={!data.gender}
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
    width: "44.44%", // 4/9 of the total width
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
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 40,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  genderOption: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  genderImage: {
    width: "100%",
    height: "100%",
  },
  genderImageStyle: {
    borderRadius: 16,
  },
  genderOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 16,
  },
  checkmarkContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "white",
    borderRadius: 12,
  },
  genderTextContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
  },
  genderTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  genderSubtitle: {
    color: "#A26FFD",
    fontSize: 14,
  },
  descriptionText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginBottom: 24,
  },
  preferNotButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
  },
  preferNotText: {
    color: "#A26FFD",
    fontSize: 16,
    fontWeight: "500",
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
