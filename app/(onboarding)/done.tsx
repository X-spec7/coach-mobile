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
import { API_ENDPOINTS } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DoneScreen() {
  const { data } = useOnboarding();
  console.log(data);

  const handleUpdateUserInfo = async () => {
    try {
      const heightValue =
        data.height.unit === "cm"
          ? parseFloat(String(data.height.cm))
          : data.height.feet !== undefined && data.height.inches !== undefined
          ? parseFloat(
              (data.height.feet * 30.48 + data.height.inches * 2.54).toFixed(1)
            )
          : null;

      const userData = {
        notificationsEnabled: data.notificationsEnabled,
        height: {
          value: heightValue,
          unit: data.height.unit,
          feet: data.height.unit === "ft" ? data.height.feet ?? null : null,
          inches: data.height.unit === "ft" ? data.height.inches ?? null : null,
        },
        weight: {
          value: parseFloat(data.weight.value),
          unit: data.weight.unit,
        },
        gender: data.gender,
        interests: data.interests,
        helpCategories: Array.isArray(data.helpOption)
          ? data.helpOption
          : [data.helpOption].filter(Boolean),
      };

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(API_ENDPOINTS.CLIENT_USER.UPDATE_USER_INFO, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        return;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const responseData = await response.json();
        console.log("Success response:", responseData);
        router.replace("/(tabs)");
      } else {
        const text = await response.text();
        console.error("Unexpected response format:", {
          contentType,
          body: text,
        });
      }
    } catch (error) {
      console.error("Error updating user info:", error);
    }
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
          onPress={handleUpdateUserInfo}
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
