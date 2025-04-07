export const API_BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:8000/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/authentication/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
};
