import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "./onboarding-context";

export default function DoneScreen() {
  const { data } = useOnboarding();
  console.log(data);
  const handleGetStarted = () => {
    router.replace("/(tabs)"); // Or your main app entry point
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="man" size={80} color="#A26FFD" />
          <Ionicons
            name="barbell"
            size={32}
            color="#A26FFD"
            style={styles.barbellIcon}
          />
        </View>
        <Text style={styles.doneText}>Done</Text>
        <Text style={styles.title}>You are ready to{"\n"}exercise!</Text>
        <Text style={styles.subtitle}>
          Thanks for signing up! Let's{"\n"}begin your journey to a healthier{" "}
          <Text style={styles.highlight}>life.</Text>
        </Text>
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "#A26FFD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  barbellIcon: {
    position: "absolute",
    top: 40,
    left: 90,
  },
  doneText: {
    color: "#A26FFD",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  highlight: {
    color: "#A26FFD",
    fontWeight: "700",
  },
  bottomContainer: {
    padding: 24,
  },
  getStartedButton: {
    backgroundColor: "#A26FFD",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
