import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Logo from "./components/Logo";

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
        <Logo size="large" />
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
});
