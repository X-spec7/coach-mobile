export const API_BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:8000/api/";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/authentication/login/`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REGISTER: `${API_BASE_URL}/authentication/register/`,
  },
  ONBOARDING: {
    GET_INTERESTS: `${API_BASE_URL}/onboarding/interests/`,
    GET_HELP_OPTIONS: `${API_BASE_URL}/onboarding/help-options/`,
  },
  CLIENT_USER: {
    GET_USER_INFO: `${API_BASE_URL}/user/`,
    UPDATE_USER_INFO: `${API_BASE_URL}/users/client/profile/`,
  },
};
