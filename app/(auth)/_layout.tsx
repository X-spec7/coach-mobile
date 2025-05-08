import { Stack } from "expo-router";
import { AuthTempProvider } from "./auth-temp-context";

export default function AuthLayout() {
  return (
    <AuthTempProvider>
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
    </AuthTempProvider>
  );
}
