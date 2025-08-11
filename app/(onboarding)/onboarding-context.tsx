import React, { createContext, useContext, useState, ReactNode } from "react";

export type Gender = "male" | "female" | "not_specified";
export type WeightUnit = "kg" | "lbs";
export type HeightUnit = "cm" | "ft";

export interface OnboardingData {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  gender: Gender;
  
  // Preferences
  notificationsEnabled: boolean;
  
  // Physical Information
  weight: {
    value: string;
    unit: WeightUnit;
  };
  height: { 
    unit: HeightUnit; 
    feet?: number; 
    inches?: number; 
    cm?: number; 
  };
  
  // Interests and Goals
  interests: string[];
  helpCategories: string[];
  goals: string[];
  
  // Coach-specific fields
  experience: number; // 1-5 stars
  specialization: string;
  yearsOfExperience: number;
  certifications: Array<{
    certificationTitle: string;
    certificationDetail: string;
  }>;
  
  // Client-specific fields
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredWorkoutTypes: string[];
  dietaryRestrictions: string[];
}

interface OnboardingContextProps {
  data: OnboardingData;
  // Basic Information
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setAddress: (address: string) => void;
  setGender: (gender: Gender) => void;
  
  // Preferences
  setNotificationsEnabled: (enabled: boolean) => void;
  
  // Physical Information
  setWeight: (weight: string, unit: WeightUnit) => void;
  setHeight: (height: {
    unit: HeightUnit;
    feet?: number;
    inches?: number;
    cm?: number;
  }) => void;
  
  // Interests and Goals
  setInterests: (interests: string[]) => void;
  setHelpCategories: (categories: string[]) => void;
  setGoals: (goals: string[]) => void;
  
  // Coach-specific
  setExperience: (stars: number) => void;
  setSpecialization: (specialization: string) => void;
  setYearsOfExperience: (years: number) => void;
  setCertifications: (certifications: Array<{
    certificationTitle: string;
    certificationDetail: string;
  }>) => void;
  
  // Client-specific
  setFitnessLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  setPreferredWorkoutTypes: (types: string[]) => void;
  setDietaryRestrictions: (restrictions: string[]) => void;
  
  // Utility
  reset: () => void;
}

const defaultData: OnboardingData = {
  // Basic Information
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  address: "",
  gender: "not_specified",
  
  // Preferences
  notificationsEnabled: false,
  
  // Physical Information
  weight: {
    value: "",
    unit: "lbs",
  },
  height: { unit: "ft", feet: 5, inches: 0 },
  
  // Interests and Goals
  interests: [],
  helpCategories: [],
  goals: [],
  
  // Coach-specific fields
  experience: 0,
  specialization: "",
  yearsOfExperience: 0,
  certifications: [],
  
  // Client-specific fields
  fitnessLevel: 'beginner',
  preferredWorkoutTypes: [],
  dietaryRestrictions: [],
};

const OnboardingContext = createContext<OnboardingContextProps | undefined>(
  undefined
);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<OnboardingData>(defaultData);

  // Basic Information setters
  const setFirstName = (firstName: string) =>
    setData((d) => ({ ...d, firstName }));
  const setLastName = (lastName: string) =>
    setData((d) => ({ ...d, lastName }));
  const setEmail = (email: string) =>
    setData((d) => ({ ...d, email }));
  const setPassword = (password: string) =>
    setData((d) => ({ ...d, password }));
  const setPhoneNumber = (phoneNumber: string) =>
    setData((d) => ({ ...d, phoneNumber }));
  const setAddress = (address: string) =>
    setData((d) => ({ ...d, address }));
  const setGender = (gender: Gender) => 
    setData((d) => ({ ...d, gender }));
  
  // Preferences setters
  const setNotificationsEnabled = (notificationsEnabled: boolean) =>
    setData((d) => ({ ...d, notificationsEnabled }));
  
  // Physical Information setters
  const setWeight = (value: string, unit: WeightUnit) =>
    setData((d) => ({ ...d, weight: { value, unit } }));
  const setHeight = (height: {
    unit: HeightUnit;
    feet?: number;
    inches?: number;
    cm?: number;
  }) => setData((d) => ({ ...d, height }));
  
  // Interests and Goals setters
  const setInterests = (interests: string[]) =>
    setData((d) => ({ ...d, interests }));
  const setHelpCategories = (helpCategories: string[]) =>
    setData((d) => ({ ...d, helpCategories }));
  const setGoals = (goals: string[]) =>
    setData((d) => ({ ...d, goals }));
  
  // Coach-specific setters
  const setExperience = (experience: number) =>
    setData((d) => ({ ...d, experience }));
  const setSpecialization = (specialization: string) =>
    setData((d) => ({ ...d, specialization }));
  const setYearsOfExperience = (yearsOfExperience: number) =>
    setData((d) => ({ ...d, yearsOfExperience }));
  const setCertifications = (certifications: Array<{
    certificationTitle: string;
    certificationDetail: string;
  }>) => setData((d) => ({ ...d, certifications }));
  
  // Client-specific setters
  const setFitnessLevel = (fitnessLevel: 'beginner' | 'intermediate' | 'advanced') =>
    setData((d) => ({ ...d, fitnessLevel }));
  const setPreferredWorkoutTypes = (preferredWorkoutTypes: string[]) =>
    setData((d) => ({ ...d, preferredWorkoutTypes }));
  const setDietaryRestrictions = (dietaryRestrictions: string[]) =>
    setData((d) => ({ ...d, dietaryRestrictions }));
  
  // Utility
  const reset = () => setData(defaultData);

  return (
    <OnboardingContext.Provider
      value={{
        data,
        // Basic Information
        setFirstName,
        setLastName,
        setEmail,
        setPassword,
        setPhoneNumber,
        setAddress,
        setGender,
        
        // Preferences
        setNotificationsEnabled,
        
        // Physical Information
        setWeight,
        setHeight,
        
        // Interests and Goals
        setInterests,
        setHelpCategories,
        setGoals,
        
        // Coach-specific
        setExperience,
        setSpecialization,
        setYearsOfExperience,
        setCertifications,
        
        // Client-specific
        setFitnessLevel,
        setPreferredWorkoutTypes,
        setDietaryRestrictions,
        
        // Utility
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
