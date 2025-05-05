import { Stack } from "expo-router";
import { OnboardingProvider } from "./onboarding-context";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="height" />
        <Stack.Screen name="interests" />
        <Stack.Screen name="experience" />
      </Stack>
    </OnboardingProvider>
  );
}
