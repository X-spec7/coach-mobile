// API Configuration with environment-specific fallbacks
const getApiBaseUrl = () => {
  // First, check for environment variable
  if (process.env.EXPO_PUBLIC_BASE_URL) {
    return process.env.EXPO_PUBLIC_BASE_URL;
  }

  // For development, use localhost (works for iOS Simulator on same machine)
  // For physical devices, you'll need to set EXPO_PUBLIC_BASE_URL to your computer's IP
  return "http://localhost:8888/api";
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/authentication/login/`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REGISTER: `${API_BASE_URL}/authentication/register/`,
    VERIFY_CODE: `${API_BASE_URL}/authentication/verify-code/`,
    RESEND_CODE: `${API_BASE_URL}/authentication/resend-code/`,
  },
  ONBOARDING: {
    GET_INTERESTS: `${API_BASE_URL}/onboarding/interests/`,
    GET_HELP_OPTIONS: `${API_BASE_URL}/onboarding/help-options/`,
  },
  USER: {
    GET_USER_INFO: `${API_BASE_URL}/users/profile/`,
    SELECT_MEAL_PLAN: `${API_BASE_URL}/users/select-meal-plan/`,
  },
  CLIENT_USER: {
    GET_USER_INFO: `${API_BASE_URL}/users/client/profile/`,
    UPDATE_USER_INFO: `${API_BASE_URL}/users/client/profile/`,
  },
};
