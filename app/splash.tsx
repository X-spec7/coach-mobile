import { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { router } from "expo-router";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(onboarding)/welcome");
    }, 100000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.preTitle}>COA-</Text>
        <Text style={styles.title}>CH</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  preTitle: {
    fontFamily: "Roboto",
    fontWeight: "700",
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: 0,
    color: "#A26FFD",
  },
  title: {
    fontFamily: "Roboto",
    fontWeight: "700",
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: 0,
    color: "#000000",
  },
});
