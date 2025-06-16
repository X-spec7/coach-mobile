import { ImageSourcePropType } from "react-native";
import { getToken } from "./auth";

const API_BASE_URL = "http://0.0.0.0:8888/api";

export interface Food {
  name: string;
  amount: string;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface MealPlanFoodItem {
  name: string;
  amount: string;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface MealTime {
  id: number;
  day: string;
  time: string;
  mealplan_food_items: MealPlanFoodItem[];
}

export interface MealPlan {
  id: number;
  image: ImageSourcePropType | { uri: string } | null;
  title?: string;
  name?: string;
  protein?: number;
  fat?: number;
  carbs?: number;
  calories?: number;
  description?: string;
  meal_times: MealTime[];
}

export interface MealPlanDetails {
  category: string;
  name: string;
  description: string;
  calories: number;
  macros: {
    key: string;
    label: string;
    value: number;
    color: string;
  }[];
  meals: {
    title: string;
    protein: number;
    fat: number;
    carbs: number;
  }[];
}

export const getAuthHeaders = async () => {
  const token = await getToken();
  console.log("Auth token for request:", token ? "Present" : "Missing");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token.accessToken}`;
    console.log(
      "Authorization header set with token:",
      token.accessToken.substring(0, 20) + "..."
    );
  } else {
    console.log("No token available, proceeding without authorization");
  }

  return headers;
};

export const fetchMealPlans = async (): Promise<MealPlan[]> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/mealplan/`;
    console.log("Making request to:", url);
    console.log("Request headers:", headers);

    const response = await fetch(url, {
      headers,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      if (response.status === 401) {
        console.log("Authentication failed - 401 Unauthorized");
        throw new Error("Authentication required");
      }
      const errorText = await response.text();
      console.log("Error response body:", errorText);
      throw new Error("Failed to fetch meal plans");
    }

    const data = await response.json();
    console.log("Meal plans response data:", data);
    return data.mealPlans;
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    throw error;
  }
};

export const fetchMealPlanDetails = async (
  id: number
): Promise<MealPlanDetails> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/mealplan/${id}/`;
    console.log("Making request to:", url);
    console.log("Request headers:", headers);

    const response = await fetch(url, {
      headers,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      if (response.status === 401) {
        console.log("Authentication failed - 401 Unauthorized");
        throw new Error("Authentication required");
      }
      const errorText = await response.text();
      console.log("Error response body:", errorText);
      throw new Error("Failed to fetch meal plan details");
    }

    const data = await response.json();
    console.log("Meal plan details response data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching meal plan details:", error);
    throw error;
  }
};

export const fetchAllFoods = async (): Promise<Food[]> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/mealplan/food-items/`;
    console.log("Making request to:", url);
    console.log("Request headers:", headers);

    const response = await fetch(url, {
      headers,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      if (response.status === 401) {
        console.log("Authentication failed - 401 Unauthorized");
        throw new Error("Authentication required");
      }
      const errorText = await response.text();
      console.log("Error response body:", errorText);
      throw new Error("Failed to fetch foods");
    }

    const data = await response.json();
    console.log("Foods response data:", data);
    return data.foodItems || [];
  } catch (error) {
    console.error("Error fetching foods:", error);
    throw error;
  }
};
