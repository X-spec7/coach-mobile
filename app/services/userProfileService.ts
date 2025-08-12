import { getAuthHeaders } from "./api";
import { handle401Error } from "../utils/auth";
import { API_ENDPOINTS } from "@/constants/api";

// Types based on API documentation
export type Gender = 'male' | 'female' | 'not_specified';
export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft';

export interface Height {
  value: number | null;
  unit: HeightUnit;
  feet?: number | null;
  inches?: number | null;
}

export interface Weight {
  value: number;
  unit: WeightUnit;
}

export interface Interest {
  id: string;
  name: string;
}

export interface HelpCategory {
  id: string;
  name: string;
}

export interface Certification {
  certificationTitle: string;
  certificationDetail: string;
}

export interface CoachProfile {
  certification: string | null;
  specialization: string | null;
  yearsOfExperience: number | null;
  bannerImageUrl: string | null;
  listed: boolean;
  certifications: Certification[];
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  userType: 'Coach' | 'Client';
  phoneNumber: string | null;
  address: string | null;
  gender: Gender;
  emailVerified: boolean;
  notificationsEnabled: boolean;
  avatarImageUrl: string | null;
  height: Height | null;
  weight: Weight | null;
  interests: Interest[];
  helpCategories: HelpCategory[];
  selectedMealPlan: any | null;
  coachProfile?: CoachProfile;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  message: string;
  user: UserProfile;
}

export interface ClientProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  gender?: Gender;
  notificationsEnabled?: boolean;
  interests?: string[];
  helpCategories?: string[];
  avatar?: string; // base64 image
}

export interface CoachProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  gender?: Gender;
  notificationsEnabled?: boolean;
  height?: number;
  weight?: number;
  specialization?: string;
  yearsOfExperience?: number;
  certifications?: Certification[];
}

export interface DetailedClientProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  gender?: Gender;
  notificationsEnabled?: boolean;
  height?: {
    value: number;
    unit: HeightUnit;
  };
  weight?: {
    value: number;
    unit: WeightUnit;
  };
  interests?: string[];
  helpCategories?: string[];
}

class UserProfileService {
  static async getUserProfile(): Promise<ProfileResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE.GET_PROFILE, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handle401Error();
        }
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async updateClientProfile(data: ClientProfileUpdateRequest): Promise<ProfileResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE.UPDATE_CLIENT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handle401Error();
        }
        throw new Error(`Failed to update client profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating client profile:', error);
      throw error;
    }
  }

  static async updateCoachProfile(data: CoachProfileUpdateRequest): Promise<ProfileResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE.UPDATE_COACH, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handle401Error();
        }
        throw new Error(`Failed to update coach profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating coach profile:', error);
      throw error;
    }
  }

  static async getClientProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE.GET_CLIENT_PROFILE, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handle401Error();
        }
        throw new Error(`Failed to fetch client profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching client profile:', error);
      throw error;
    }
  }

  static async updateClientProfileDetailed(data: DetailedClientProfileUpdateRequest): Promise<ProfileResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE.UPDATE_CLIENT_PROFILE, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handle401Error();
        }
        throw new Error(`Failed to update client profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating client profile:', error);
      throw error;
    }
  }

  // Utility functions for height/weight conversion
  static convertHeightToCm(feet: number, inches: number): number {
    return (feet * 30.48) + (inches * 2.54);
  }

  static convertCmToFeetInches(cm: number): { feet: number; inches: number } {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  }

  static convertWeightToKg(lbs: number): number {
    return lbs * 0.453592;
  }

  static convertKgToLbs(kg: number): number {
    return kg * 2.20462;
  }
}

export { UserProfileService }; 
}; 
}; 