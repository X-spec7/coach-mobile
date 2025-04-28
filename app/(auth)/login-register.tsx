import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import Carousel from "react-native-reanimated-carousel";

const { width: screenWidth } = Dimensions.get("window");

interface Slide {
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    title: "Fit with us and Stay healthy",
    description:
      "We'll help you stay healthy and fit by exercising and monitoring your diet",
  },
  {
    title: "Track Your Progress",
    description: "Monitor your workouts and achievements",
  },
  {
    title: "Get Expert Guidance",
    description: "Access professional coaching anytime",
  },
];

export default function LoginRegisterScreen() {
  const [activeSlide, setActiveSlide] = useState(0);

  const renderItem = ({ item }: { item: Slide }) => {
    return (
      <View style={styles.slide}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.push("/(auth)/sign-in")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.carouselContainer}>
        <Carousel
          loop
          width={screenWidth}
          height={300}
          autoPlay={true}
          data={slides}
          scrollAnimationDuration={1000}
          onSnapToItem={(index) => setActiveSlide(index)}
          renderItem={renderItem}
        />
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                activeSlide === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signInButton]}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>
            By continuing, you agree to our{" "}
            <Text style={styles.linkText} onPress={() => {}}>
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text style={styles.linkText} onPress={() => {}}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  skipButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    color: "#A26FFD",
    fontSize: 16,
    fontWeight: "500",
  },
  carouselContainer: {
    flex: 1,
    justifyContent: "center",
  },
  slide: {
    width: screenWidth,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#A26FFD",
  },
  bottomContainer: {
    display: "flex",
    padding: 20,
    paddingBottom: 40,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpButton: {
    backgroundColor: "#A26FFD",
  },
  signInButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#A26FFD",
  },
  signUpText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signInText: {
    color: "#A26FFD",
    fontSize: 16,
    fontWeight: "600",
  },
  privacyContainer: {
    alignItems: "center",
  },
  privacyText: {
    color: "#666666",
    fontSize: 12,
    textAlign: "center",
  },
  linkText: {
    color: "#A26FFD",
    textDecorationLine: "underline",
  },
});
