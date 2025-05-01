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

interface NotificationType {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}

const notificationTypes: NotificationType[] = [
  { icon: "calendar", title: "New weekly healthy reminder" },
  { icon: "flame", title: "Motivational reminder" },
  { icon: "heart", title: "Personalized program" },
];

export default function NotificationsScreen() {
  const handleAllow = () => {
    router.push("/(onboarding)/gender");
  };

  const handleSkip = () => {
    router.push("/(onboarding)/gender");
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
        <Text style={styles.stepText}>Step 2/9</Text>
        <Text style={styles.title}>Turn on Notifications</Text>

        {/* Bell Icon Circle */}
        <View style={styles.bellContainer}>
          <Ionicons name="notifications" size={40} color="#A26FFD" />
        </View>

        {/* Notification Types */}
        <View style={styles.notificationList}>
          {notificationTypes.map((type, index) => (
            <View key={index} style={styles.notificationItem}>
              <View style={styles.iconContainer}>
                <Ionicons name={type.icon} size={24} color="#A26FFD" />
              </View>
              <Text style={styles.notificationText}>{type.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.allowButton} onPress={handleAllow}>
          <Text style={styles.allowButtonText}>Allow</Text>
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
    width: "22.22%", // 2/9 of the total width
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
    alignItems: "center",
  },
  stepText: {
    color: "#A26FFD",
    fontSize: 16,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 40,
    alignSelf: "flex-start",
  },
  bellContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(162, 111, 253, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  notificationList: {
    width: "100%",
    gap: 24,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(162, 111, 253, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    fontSize: 16,
    color: "#000",
  },
  bottomContainer: {
    padding: 24,
  },
  allowButton: {
    backgroundColor: "#A26FFD",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  allowButtonText: {
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
