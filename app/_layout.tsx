import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Logo from "./components/Logo";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  useEffect(() => {
    if (isSplashComplete && !isLoading) {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login-register");
      }
    }
  }, [isSplashComplete, isLoading, isAuthenticated]);

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
      {isAuthenticated ? (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(onboarding)" />
        </>
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <SubscriptionProvider>
          <RootLayoutNav />
        </SubscriptionProvider>
      </ChatProvider>
    </AuthProvider>
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
