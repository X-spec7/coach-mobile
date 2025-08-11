import { getAuthHeaders } from "./api";
import { handle401Error } from "../utils/auth";
import { API_BASE_URL } from "@/constants/api";

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

// API Endpoints
const USER_PROFILE_ENDPOINTS = {
  GET_PROFILE: `${API_BASE_URL}/users/profile/`,
  UPDATE_CLIENT_PROFILE: `${API_BASE_URL}/users/client/update/`,
  UPDATE_COACH_PROFILE: `${API_BASE_URL}/users/coach/update/`,
  GET_CLIENT_PROFILE: `${API_BASE_URL}/users/client/profile/`,
  UPDATE_CLIENT_PROFILE_DETAILED: `${API_BASE_URL}/users/client/profile/`,
};

export const UserProfileService = {
  // Get user profile
  getUserProfile: async (): Promise<ProfileResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view your profile.');
    }

    try {
      const response = await fetch(USER_PROFILE_ENDPOINTS.GET_PROFILE, {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch profile: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Update client profile
  updateClientProfile: async (data: ClientProfileUpdateRequest): Promise<ProfileResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to update your profile.');
    }

    try {
      const response = await fetch(USER_PROFILE_ENDPOINTS.UPDATE_CLIENT_PROFILE, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (response.status === 403) {
        throw new Error('Only client users can update this profile');
      }

      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid data provided');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Update coach profile
  updateCoachProfile: async (data: CoachProfileUpdateRequest): Promise<ProfileResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to update your profile.');
    }

    try {
      const response = await fetch(USER_PROFILE_ENDPOINTS.UPDATE_COACH_PROFILE, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (response.status === 403) {
        throw new Error('Only coach users can update this profile');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Get detailed client profile
  getClientProfile: async (): Promise<UserProfile> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view your profile.');
    }

    try {
      const response = await fetch(USER_PROFILE_ENDPOINTS.GET_CLIENT_PROFILE, {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (response.status === 400) {
        throw new Error('User is not a client');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch client profile: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Update detailed client profile
  updateClientProfileDetailed: async (data: DetailedClientProfileUpdateRequest): Promise<ProfileResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to update your profile.');
    }

    try {
      const response = await fetch(USER_PROFILE_ENDPOINTS.UPDATE_CLIENT_PROFILE_DETAILED, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid data format or validation errors');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Utility function to convert height between units
  convertHeight: (height: Height, targetUnit: HeightUnit): Height => {
    if (height.unit === targetUnit) {
      return height;
    }

    if (height.unit === 'cm' && targetUnit === 'ft') {
      const totalInches = height.value! / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return {
        value: null,
        unit: 'ft',
        feet,
        inches,
      };
    }

    if (height.unit === 'ft' && targetUnit === 'cm') {
      const totalInches = (height.feet || 0) * 12 + (height.inches || 0);
      const cm = totalInches * 2.54;
      return {
        value: Math.round(cm * 10) / 10,
        unit: 'cm',
      };
    }

    return height;
  },

  // Utility function to convert weight between units
  convertWeight: (weight: Weight, targetUnit: WeightUnit): Weight => {
    if (weight.unit === targetUnit) {
      return weight;
    }

    if (weight.unit === 'kg' && targetUnit === 'lbs') {
      return {
        value: Math.round(weight.value * 2.20462 * 10) / 10,
        unit: 'lbs',
      };
    }

    if (weight.unit === 'lbs' && targetUnit === 'kg') {
      return {
        value: Math.round(weight.value * 0.453592 * 10) / 10,
        unit: 'kg',
      };
    }

    return weight;
  },
}; 