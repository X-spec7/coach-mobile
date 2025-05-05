import React, { createContext, useContext, useState, ReactNode } from "react";

export type Gender = "male" | "female" | null;
export type WeightUnit = "kg" | "lbs";
export type HeightUnit = "cm" | "ft";

export interface OnboardingData {
  password: string;
  notificationsEnabled: boolean;
  gender: Gender;
  weight: string;
  weightUnit: WeightUnit;
  height: { unit: HeightUnit; feet?: number; inches?: number; cm?: number };
  interests: string[];
  experience: number; // 1-5 stars
}

interface OnboardingContextProps {
  data: OnboardingData;
  setPassword: (password: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setGender: (gender: Gender) => void;
  setWeight: (weight: string, unit: WeightUnit) => void;
  setHeight: (height: {
    unit: HeightUnit;
    feet?: number;
    inches?: number;
    cm?: number;
  }) => void;
  setInterests: (interests: string[]) => void;
  setExperience: (stars: number) => void;
  reset: () => void;
}

const defaultData: OnboardingData = {
  password: "",
  notificationsEnabled: false,
  gender: null,
  weight: "",
  weightUnit: "lbs",
  height: { unit: "ft", feet: 5, inches: 0 },
  interests: [],
  experience: 0,
};

const OnboardingContext = createContext<OnboardingContextProps | undefined>(
  undefined
);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<OnboardingData>(defaultData);

  const setPassword = (password: string) =>
    setData((d) => ({ ...d, password }));
  const setNotificationsEnabled = (notificationsEnabled: boolean) =>
    setData((d) => ({ ...d, notificationsEnabled }));
  const setGender = (gender: Gender) => setData((d) => ({ ...d, gender }));
  const setWeight = (weight: string, weightUnit: WeightUnit) =>
    setData((d) => ({ ...d, weight, weightUnit }));
  const setHeight = (height: {
    unit: HeightUnit;
    feet?: number;
    inches?: number;
    cm?: number;
  }) => setData((d) => ({ ...d, height }));
  const setInterests = (interests: string[]) =>
    setData((d) => ({ ...d, interests }));
  const setExperience = (experience: number) =>
    setData((d) => ({ ...d, experience }));
  const reset = () => setData(defaultData);

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setPassword,
        setNotificationsEnabled,
        setGender,
        setWeight,
        setHeight,
        setInterests,
        setExperience,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
