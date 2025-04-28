import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";

export default function RootLayout() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isSplashComplete) {
      // After splash, navigate directly to login-register
      router.replace("/(auth)/login-register");
    }
  }, [isSplashComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isSplashComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.preTitle}>COA-</Text>
          <Text style={styles.title}>CH</Text>
        </View>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" />
    </Stack>
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
