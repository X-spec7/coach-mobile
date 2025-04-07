import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: string;
  email: string;
  address: string;
  isSuperuser: boolean;
  phoneNumber: string;
  avatarImageUrl: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";

    if (!user && !loading && !hasSeenOnboarding) {
      router.replace("/(onboarding)/welcome");
    } else if (!user && !loading && !inAuthGroup) {
      router.replace("/auth/sign-in");
    } else if (user) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      const onboardingStatus = await AsyncStorage.getItem("hasSeenOnboarding");

      setHasSeenOnboarding(onboardingStatus === "true");

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    setHasSeenOnboarding(true);
  };

  const signIn = async (token: string, userData: User) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  return {
    user,
    loading,
    completeOnboarding,
    signIn,
    signOut,
  };
}
