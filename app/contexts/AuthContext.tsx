import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getToken, storeToken, clearToken } from "../services/auth";
import * as SecureStore from "expo-secure-store";
import { API_ENDPOINTS } from "@/constants/api";

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: string;
  email: string;
  avatarImageUrl?: string | null;
  selectedMealPlan?: {
    id: number
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: AuthToken | null;
  user: User | null;
  isLoading: boolean;
  signIn: (token: AuthToken) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<AuthToken | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      setIsLoading(true);
      try {
        const storedToken = await getToken();
        setToken(storedToken);
        if (storedToken && storedToken.accessToken) {
          // Try to get user from SecureStore first
          const userString = await SecureStore.getItemAsync("user");
          if (userString) {
            setUser(JSON.parse(userString));
          } else {
            // Fetch user from API
            const res = await fetch(API_ENDPOINTS.USER.GET_USER_INFO, {
              headers: { Authorization: `Bearer ${storedToken.accessToken}` },
            });
            if (res.ok) {
              const data = await res.json();
              setUser(data.user);
              await SecureStore.setItemAsync("user", JSON.stringify(data.user));
            } else {
              setUser(null);
              await SecureStore.deleteItemAsync("user");
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  const signIn = async (newToken: AuthToken) => {
    await storeToken(newToken);
    setToken(newToken);
    // Fetch user profile after login
    const res = await fetch(API_ENDPOINTS.USER.GET_USER_INFO, {
      headers: { Authorization: `Bearer ${newToken.accessToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      await SecureStore.setItemAsync("user", JSON.stringify(data.user));
    } else {
      setUser(null);
      await SecureStore.deleteItemAsync("user");
    }
  };

  const signOut = async () => {
    await clearToken();
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync("user");
  };

  const value: AuthContextType = {
    isAuthenticated: !!token && !!user,
    token,
    user,
    isLoading,
    signIn,
    signOut,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
