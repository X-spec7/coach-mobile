import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import Carousel from "react-native-reanimated-carousel";

const { width: screenWidth } = Dimensions.get("window");

interface Slide {
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    title: "Welcome to Coach",
    description: "Your personal fitness journey starts here",
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

export default function WelcomeScreen() {
  const { completeOnboarding } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);

  const renderItem = ({ item, index }: { item: Slide; index: number }) => {
    return (
      <View style={styles.slide}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace("/auth/sign-in");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleGetStarted}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.carouselContainer}>
        <Carousel
          loop
          width={screenWidth}
          height={300}
          autoPlay={false}
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
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => router.push("/auth/sign-up")}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push("/auth/sign-in")}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.privacyText}>
          By continuing, you agree to our{" "}
          <Text style={styles.linkText}>Terms of Service</Text> and{" "}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skipButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
  skipText: {
    color: "#666666",
    fontSize: 16,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: "center",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
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
    backgroundColor: "#CCCCCC",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#000000",
  },
  bottomContainer: {
    padding: 20,
  },
  signUpButton: {
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  signUpText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  signInButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
    marginBottom: 16,
  },
  signInText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  privacyText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  linkText: {
    color: "#000000",
    textDecorationLine: "underline",
  },
});
