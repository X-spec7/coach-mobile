import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="height" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="experience" />
    </Stack>
  );
}
