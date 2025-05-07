import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="login-register"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login-register" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verification" />
    </Stack>
  );
}
