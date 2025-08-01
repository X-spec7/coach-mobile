import * as SecureStore from "expo-secure-store";
import { API_ENDPOINTS } from "../constants/api";

const TOKEN_KEY = "auth_token";

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Resend email verification
export const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend verification email');
    }

    return data;
  } catch (error) {
    console.error('Error resending verification email:', error);
    if (error instanceof TypeError && error.message === 'Network request failed') {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw error;
  }
};

// Verify email with verification code
export const verifyEmail = async (email: string, verificationCode: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        verificationCode 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify email');
    }

    return data;
  } catch (error) {
    console.error('Error verifying email:', error);
    if (error instanceof TypeError && error.message === 'Network request failed') {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw error;
  }
};

export const storeToken = async (token: AuthToken): Promise<void> => {
  try {
    console.log("Storing token in secure storage:", token);
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(token));
    console.log("Token stored successfully");
  } catch (error) {
    console.error("Error storing auth token:", error);
    throw new Error("Failed to store authentication token");
  }
};

export const getToken = async (): Promise<AuthToken | null> => {
  try {
    const tokenString = await SecureStore.getItemAsync(TOKEN_KEY);

    if (!tokenString) {
      console.log("No token found in secure storage");
      return null;
    }

    const token = JSON.parse(tokenString) as AuthToken;

    // Check if token is expired
    if (token.expiresAt && token.expiresAt < Date.now()) {
      console.log("Token is expired, clearing it");
      await clearToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    console.log("Clearing token from secure storage");
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log("Token cleared successfully");
  } catch (error) {
    console.error("Error clearing auth token:", error);
    throw new Error("Failed to clear authentication token");
  }
};
