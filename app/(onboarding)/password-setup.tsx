import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Pressable,
  ViewStyle,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { saveProgress } from "../../utils/storage";
import analytics from "@/utils/analytics";

interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

interface OnboardingScreenProps {
  step: number;
  totalSteps: number;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}

interface OnboardingStyles {
  container: ViewStyle;
  header: ViewStyle;
  content: ViewStyle;
  bottomContainer: ViewStyle;
  // ... other common styles
}

export default function PasswordSetupScreen() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentStep = 1;
  const nextScreen = "/(onboarding)/notifications";

  const passwordRequirements: PasswordRequirement[] = [
    { label: "8+ characters", isValid: password.length >= 8 },
    { label: "1 symbols", isValid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: "1 uppercase", isValid: /[A-Z]/.test(password) },
    { label: "1 lowercase", isValid: /[a-z]/.test(password) },
    { label: "1 number", isValid: /[0-9]/.test(password) },
  ];

  const getPasswordStrength = useCallback(() => {
    return passwordRequirements.filter((req) => req.isValid).length;
  }, [password]);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await saveProgress(currentStep);
      router.push(nextScreen);
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/(onboarding)/notifications");
  };

  const handleBack = () => {
    router.back();
  };

  const trackScreen = (screenName: string) => {
    analytics.logEvent("screen_view", {
      screen_name: screenName,
      screen_class: "Onboarding",
    });
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
        <Text style={styles.stepText}>Step 1/9</Text>
        <Text style={styles.title}>Set Your Password</Text>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#666"
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#666"
            />
          </Pressable>
        </View>

        {/* Password Strength Meter */}
        <View style={styles.strengthMeter}>
          {[...Array(4)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.strengthSegment,
                index < getPasswordStrength() && styles.strengthSegmentFilled,
              ]}
            />
          ))}
        </View>

        {/* Requirements List */}
        <View style={styles.requirementsList}>
          {passwordRequirements.map((requirement, index) => (
            <Text
              key={index}
              style={[
                styles.requirementText,
                requirement.isValid && styles.requirementMet,
              ]}
            >
              • {requirement.label}
            </Text>
          ))}
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          accessible={true}
          accessibilityLabel="Continue to next step"
          accessibilityHint="Double tap to proceed to the next onboarding step"
          style={[
            styles.continueButton,
            getPasswordStrength() === passwordRequirements.length &&
              styles.continueButtonActive,
          ]}
          onPress={handleContinue}
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
    width: "11.11%", // 1/9 of the total width
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
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    padding: 8,
  },
  strengthMeter: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  strengthSegmentFilled: {
    backgroundColor: "#A26FFD",
  },
  requirementsList: {
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: "#666",
  },
  requirementMet: {
    color: "#A26FFD",
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
