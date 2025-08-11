import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useOnboarding } from "./onboarding-context";

export default function DoneScreen() {
  const router = useRouter();
  const { data } = useOnboarding();

  const handleGetStarted = () => {
    // Navigate to the main app
    router.replace("/(tabs)");
  };

  const formatInterests = () => {
    return data.interests.length > 0 ? data.interests.join(", ") : "None selected";
  };

  const formatHelpCategories = () => {
    return data.helpCategories.length > 0 ? data.helpCategories.join(", ") : "None selected";
  };

  const formatGoals = () => {
    return data.goals.length > 0 ? data.goals.join(", ") : "None selected";
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎉</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome to Coach Mobile!</Text>
        <Text style={styles.subtitle}>
          Your profile has been created successfully. Here's what we've captured:
        </Text>

        {/* Profile Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Profile Summary</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Name:</Text>
            <Text style={styles.summaryValue}>
              {data.firstName} {data.lastName}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Email:</Text>
            <Text style={styles.summaryValue}>{data.email}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gender:</Text>
            <Text style={styles.summaryValue}>
              {data.gender === "not_specified" ? "Not specified" : data.gender}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Weight:</Text>
            <Text style={styles.summaryValue}>
              {data.weight.value} {data.weight.unit}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Height:</Text>
            <Text style={styles.summaryValue}>
              {data.height.unit === "ft" 
                ? `${data.height.feet}'${data.height.inches}"`
                : `${data.height.cm} cm`
              }
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Interests:</Text>
            <Text style={styles.summaryValue}>{formatInterests()}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Help Categories:</Text>
            <Text style={styles.summaryValue}>{formatHelpCategories()}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Goals:</Text>
            <Text style={styles.summaryValue}>{formatGoals()}</Text>
          </View>

          {data.specialization && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Specialization:</Text>
              <Text style={styles.summaryValue}>{data.specialization}</Text>
            </View>
          )}

          {data.yearsOfExperience > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Years of Experience:</Text>
              <Text style={styles.summaryValue}>{data.yearsOfExperience}</Text>
            </View>
          )}

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Notifications:</Text>
            <Text style={styles.summaryValue}>
              {data.notificationsEnabled ? "Enabled" : "Disabled"}
            </Text>
          </View>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        {/* Additional Info */}
        <Text style={styles.infoText}>
          You can update your profile information anytime from the settings menu.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#A26FFD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: "#1a1a1a",
    flex: 2,
    textAlign: "right",
  },
  button: {
    backgroundColor: "#A26FFD",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
