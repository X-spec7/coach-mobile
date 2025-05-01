import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveProgress = async (step: number) => {
  try {
    await AsyncStorage.setItem("@onboarding_progress", step.toString());
  } catch (error) {
    console.error("Error saving progress:", error);
  }
};
