import { ImageSourcePropType } from "react-native";
import { getToken } from "./auth";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

export interface Food {
  id: number;
  name: string;
  amount: string;
  fooditem_icon: string;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface SuitableFood {
  id: number;
  name: string;
  amount: string;
  fooditem_icon: string;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface MealPlanFoodItem {
  id: number;
  name: string;
  amount: string;
  protein?: number;
  fat?: number;
  carbs?: number;
  food_item_details: {
    id: number;
    name: string;
    fooditem_icon: string;
  };
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
  mealPlan: MealPlan;
}

export const getAuthHeaders = async () => {
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token.accessToken}`;
  } else {
    console.log("No token available, proceeding without authorization");
  }

  return headers;
};

export const fetchMealPlans = async (): Promise<MealPlan[]> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/mealplan/`;

    const response = await fetch(url, {
      headers,
    });

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

    const response = await fetch(url, {
      headers,
    });

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

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log("Authentication failed - 401 Unauthorized");
        throw new Error("Authentication required");
      }
      const errorText = await response.text();
      throw new Error("Failed to fetch foods");
    }

    const data = await response.json();
    return data.foodItems || [];
  } catch (error) {
    console.error("Error fetching foods:", error);
    throw error;
  }
};

export const updateMealPlan = async (
  mealPlanId: number,
  data: {
    calories: number;
    protein: number;
    fat: number;
    carb: number;
  }
): Promise<MealPlan> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/mealplan/${mealPlanId}/`;
    console.log("Making request to:", url);
    console.log("Request data:", data);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(`Failed to update meal plan: ${response.status}`);
    }

    const updatedMealPlan = await response.json();
    console.log("Updated meal plan:", updatedMealPlan);
    return updatedMealPlan;
  } catch (error) {
    console.error("Error updating meal plan:", error);
    throw error;
  }
};

export const updateMealPlanFoodItem = async (
  mealPlanId: number,
  mealTimeId: number,
  foodItemId: number,
  newFoodItem: SuitableFood
): Promise<MealPlan> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/mealplan/${mealPlanId}/`;
    console.log("Making request to:", url);

    // Get the meal time details from the current meal plan
    const currentMealPlan = await fetchMealPlanDetails(mealPlanId);
    console.log("Current meal plan before update:", currentMealPlan);

    const currentMealTime = currentMealPlan.mealPlan.meal_times.find(
      (meal: MealTime) => meal.id === mealTimeId
    );

    if (!currentMealTime) {
      throw new Error(`Meal time with ID ${mealTimeId} not found`);
    }

    // Create payload with all meal times, updating only the specific food item
    const payload = {
      meal_times: currentMealPlan.mealPlan.meal_times.map(
        (mealTime: MealTime) => {
          if (mealTime.id === mealTimeId) {
            // Update the specific meal time with the new food item
            return {
              time: mealTime.time,
              day: mealTime.day,
              mealplan_food_items: [
                {
                  amount: parseInt(newFoodItem.amount) || 20,
                  unit: "g",
                  food_item: newFoodItem.id,
                },
              ],
            };
          }
          // Keep other meal times unchanged
          return {
            time: mealTime.time,
            day: mealTime.day,
            mealplan_food_items: mealTime.mealplan_food_items,
          };
        }
      ),
    };

    console.log("Request payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(
        `Failed to update food item: ${response.status} - ${errorText}`
      );
    }

    const responseData = await response.json();
    console.log("API Response:", JSON.stringify(responseData, null, 2));

    // Handle the response with the correct structure
    if (responseData.mealplan) {
      return responseData.mealplan;
    } else if (responseData.mealPlan) {
      return responseData.mealPlan;
    } else if (responseData.meal_times) {
      return {
        ...currentMealPlan.mealPlan,
        meal_times: responseData.meal_times,
      };
    } else {
      console.error("Unexpected response structure:", responseData);
      throw new Error("Unexpected response structure from API");
    }
  } catch (error) {
    console.error("Error updating food item:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to update food item: ${error.message}`);
    }
    throw new Error("Failed to update food item: An unexpected error occurred");
  }
};

export const selectMealPlan = async (mealPlanId: number): Promise<void> => {
  try {
    console.log("=== selectMealPlan called ===");
    console.log("mealPlanId:", mealPlanId);

    const headers = await getAuthHeaders();
    const url = API_ENDPOINTS.USER.SELECT_MEAL_PLAN;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ mealPlanId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log("Authentication failed - 401 Unauthorized");
        throw new Error("Authentication required");
      }
      const errorText = await response.text();
      console.log("Error response body:", errorText);
      throw new Error(
        `Failed to select meal plan: ${response.status} - ${errorText}`
      );
    }

    const responseText = await response.text();
    console.log("Response body:", responseText);
    console.log("Meal plan selected successfully");
  } catch (error) {
    console.error("Error selecting meal plan:", error);
    throw error;
  }
};

export const deleteMealPlan = async (mealPlanId: number): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/mealplan/${mealPlanId}/delete/`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log("Authentication failed - 401 Unauthorized");
        throw new Error("Authentication required");
      }
      const errorText = await response.text();
      console.log("Error response body:", errorText);
      throw new Error(
        `Failed to delete meal plan: ${response.status} - ${errorText}`
      );
    }

    console.log("Meal plan deleted successfully");
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    throw error;
  }
};
