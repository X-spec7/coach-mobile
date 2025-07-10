import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

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
