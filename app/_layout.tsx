import { Stack, Slot } from "expo-router";
import { useEffect, useState } from "react";
import SplashScreen from "./splash";

export default function RootLayout() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isSplashComplete) {
    return <SplashScreen />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(onboarding)/welcome"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/sign-in"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/sign-up"
        options={{
          headerShown: false,
        }}
      />
      <Slot />
    </Stack>
  );
}
