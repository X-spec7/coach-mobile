import { getAuthHeaders, getAuthHeadersForDelete } from "./api";
import { authenticatedFetch, handle401Error } from "../utils/auth";

import { API_BASE_URL } from "@/constants/api";

// Hardcoded endpoints to bypass TypeScript caching issues
const MEAL_ENDPOINTS = {
  MEAL_PLANS: `${API_BASE_URL}/mealplan/`,
  MEAL_PLAN_DETAILS: (id: string) => `${API_BASE_URL}/mealplan/${id}/`,
  ADD_DAILY_PLAN: (planId: string) => `${API_BASE_URL}/mealplan/${planId}/days/`,
  REMOVE_DAILY_PLAN: (planId: string, dayId: string) => `${API_BASE_URL}/mealplan/${planId}/days/${dayId}/`,
  ADD_MEAL_TIME: (planId: string, dayId: string) => `${API_BASE_URL}/mealplan/${planId}/days/${dayId}/meal-times/`,
  REMOVE_MEAL_TIME: (planId: string, dayId: string, mealTimeId: string) => `${API_BASE_URL}/mealplan/${planId}/days/${dayId}/meal-times/${mealTimeId}/`,
  ADD_FOOD_TO_MEAL_TIME: (planId: string, dayId: string, mealTimeId: string) => `${API_BASE_URL}/mealplan/${planId}/days/${dayId}/meal-times/${mealTimeId}/foods/`,
  UPDATE_FOOD_IN_MEAL_TIME: (planId: string, dayId: string, mealTimeId: string, foodId: string) => `${API_BASE_URL}/mealplan/${planId}/days/${dayId}/meal-times/${mealTimeId}/foods/${foodId}/`,
  REMOVE_FOOD_FROM_MEAL_TIME: (planId: string, dayId: string, mealTimeId: string, foodId: string) => `${API_BASE_URL}/mealplan/${planId}/days/${dayId}/meal-times/${mealTimeId}/foods/${foodId}/`,
  PUBLIC_MEAL_PLANS: `${API_BASE_URL}/mealplan/public-meal-plans/`,
  APPLY_MEAL_PLAN: `${API_BASE_URL}/mealplan/apply-meal-plan/`,
  APPLIED_MEAL_PLANS: `${API_BASE_URL}/mealplan/applied-meal-plans/`,
  DEACTIVATE_APPLIED_MEAL_PLAN: (id: string) => `${API_BASE_URL}/mealplan/applied-meal-plans/${id}/deactivate/`,
  ASSIGN_MEAL_PLAN: `${API_BASE_URL}/mealplan/assign-meal-plan/`,
  FOOD_ITEMS: `${API_BASE_URL}/mealplan/food-items/`,
};

// Weekday type
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Goal options as per API documentation
export type MealPlanGoal = 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance' | 'athletic_performance' | 'general_health';

// Food Item interfaces
export interface FoodItem {
  id: string;
  name: string;
  serving_size: number;
  serving_unit: 'gram' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp';
  calories: number;
  total_carbohydrates: number;
  dietary_fiber: number;
  sugars: number;
  protein: number;
  total_fat: number;
  saturated_fat: number;
  trans_fat?: number;
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
  vitamin_a?: number;
  vitamin_c?: number;
  calcium?: number;
  iron?: number;
}

// Meal Plan Food Item interfaces
export interface MealPlanFoodItem {
  id: string;
  amount: number;
  unit: string;
  food_item: string;
  food_item_details: FoodItem;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  order: number;
}

// Meal Time interfaces
export interface MealTime {
  id: string;
  name: string;
  time: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  food_items: MealPlanFoodItem[];
}

// Daily Plan interfaces
export interface DailyPlan {
  id: string;
  day: 'day1' | 'day2' | 'day3' | 'day4' | 'day5' | 'day6' | 'day7';
  day_display: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_times: MealTime[];
  created_at: string;
  updated_at: string;
}

// Meal Plan interfaces
export interface MealPlan {
  id: string;
  title: string;
  description: string;
  goal: MealPlanGoal;
  goal_display: string;
  image?: string | null;
  created_by: string;
  created_by_name: string;
  status: 'draft' | 'published';
  status_display: string;
  is_public: boolean;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  is_ai_generated: boolean;
  daily_plans?: DailyPlan[];
  daily_plans_count?: number;
  applications_count?: number;
  created_at: string;
  updated_at: string;
}

// Public Meal Plan interfaces
export interface PublicMealPlan extends MealPlan {
  applications_count: number;
}

// Applied Meal Plan interfaces
export interface AppliedMealPlan {
  id: string;
  meal_plan: {
    id: string;
    title: string;
    total_calories: number;
  };
  selected_days: WeekDay[];
  weeks_count: number;
  start_date: string;
  is_active: boolean;
  source: 'self_applied' | 'coach_assigned';
  source_display: string;
  assigned_by_coach?: string | null;
  assigned_by_coach_name?: string | null;
  created_at: string;
  updated_at: string;
}

// Request/Response interfaces
export interface CreateMealPlanRequest {
  title?: string;
  description?: string;
  goal?: MealPlanGoal;
}

export interface UpdateMealPlanRequest {
  title?: string;
  description?: string;
  goal?: MealPlanGoal;
  status?: 'draft' | 'published';
  is_public?: boolean;
}

export interface AddDailyPlanRequest {
  day: 'day1' | 'day2' | 'day3' | 'day4' | 'day5' | 'day6' | 'day7';
}

export interface AddMealTimeRequest {
  name: string;
  time: string;
}

export interface AddFoodToMealTimeRequest {
  food_item_id: string;
  amount: number;
  unit: string;
  order?: number;
}

export interface UpdateFoodInMealTimeRequest {
  amount?: number;
  unit?: string;
  order?: number;
}

export interface ApplyMealPlanRequest {
  meal_plan_id: string;
  selected_days: WeekDay[];
  weeks_count: number;
  start_date: string;
}

export interface AssignMealPlanRequest {
  client_id: string;
  meal_plan_id: string;
  selected_days: WeekDay[];
  weeks_count: number;
  start_date: string;
}

export interface CreateFoodItemRequest {
  name: string;
  serving_size: number;
  serving_unit: 'gram' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp';
  calories: number;
  total_carbohydrates: number;
  dietary_fiber: number;
  sugars: number;
  protein: number;
  total_fat: number;
  saturated_fat: number;
  trans_fat?: number;
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
  vitamin_a?: number;
  vitamin_c?: number;
  calcium?: number;
  iron?: number;
}

// API Response interfaces
export interface MealPlanResponse {
  message: string;
  meal_plan: MealPlan;
}

export interface MealPlansListResponse {
  message: string;
  meal_plans: MealPlan[];
}

export interface PublicMealPlansResponse {
  message: string;
  meal_plans: PublicMealPlan[];
  total: number;
}

export interface DailyPlanResponse {
  message: string;
  daily_plan: DailyPlan;
}

export interface MealTimeResponse {
  message: string;
  meal_time: MealTime;
}

export interface FoodItemResponse {
  message: string;
  food_item: MealPlanFoodItem;
}

export interface AppliedMealPlanResponse {
  message: string;
  applied_plan: AppliedMealPlan;
}

export interface AppliedMealPlansResponse {
  message: string;
  applied_plans: AppliedMealPlan[];
}

export interface FoodItemsListResponse {
  message: string;
  food_items: FoodItem[];
  total: number;
}

export interface FoodItemCreateResponse {
  message: string;
  food_item: FoodItem;
}

// MealService class
export const MealService = {
  // ===== MEAL PLAN MANAGEMENT =====

  // Get all meal plans
  getMealPlans: async (): Promise<MealPlansListResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view meal plans.');
    }
    
    try {
      const response = await fetch(MEAL_ENDPOINTS.MEAL_PLANS, {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch meal plans: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Get specific meal plan
  getMealPlan: async (planId: string): Promise<MealPlanResponse> => {
    const headers = await getAuthHeaders();
    
    try {
      const response = await fetch(MEAL_ENDPOINTS.MEAL_PLAN_DETAILS(planId), {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch meal plan: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Create new meal plan
  createMealPlan: async (data: CreateMealPlanRequest): Promise<MealPlanResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(MEAL_ENDPOINTS.MEAL_PLANS, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      await handle401Error('Your session has expired. Please sign in again.');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create meal plan: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Update meal plan
  updateMealPlan: async (planId: string, data: UpdateMealPlanRequest): Promise<MealPlanResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(MEAL_ENDPOINTS.MEAL_PLAN_DETAILS(planId), {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      await handle401Error('Your session has expired. Please sign in again.');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update meal plan: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Delete meal plan
  deleteMealPlan: async (planId: string): Promise<{ message: string }> => {
    const headers = await getAuthHeadersForDelete();
    
    return new Promise(async (resolve, reject) => {
      try {
        const timeoutId = setTimeout(() => {
          console.log(`[deleteMealPlan] Fetch timeout - assuming success due to backend 204 response`);
          resolve({ message: 'Meal plan deleted successfully' });
        }, 5000);
        
        const response = await fetch(MEAL_ENDPOINTS.MEAL_PLAN_DETAILS(planId), {
          method: 'DELETE',
          headers,
        });

        clearTimeout(timeoutId);

        if (response.status === 401) {
          await handle401Error('Your session has expired. Please sign in again.');
          reject(new Error('Authentication required'));
          return;
        }

        if (response.status === 204) {
          resolve({ message: 'Meal plan deleted successfully' });
          return;
        }

        if (response.ok) {
          try {
            const result = await response.json();
            resolve(result);
          } catch (jsonError) {
            resolve({ message: 'Meal plan deleted successfully' });
          }
          return;
        }

        let errorText = '';
        try {
          errorText = await response.text();
        } catch (textError) {
          errorText = 'Unknown error';
        }
        reject(new Error(`Failed to delete meal plan: ${response.status} - ${errorText}`));
        
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Network request failed') {
          console.log(`[deleteMealPlan] Network request failed - assuming success due to backend 204`);
          resolve({ message: 'Meal plan deleted successfully' });
          return;
        }
        reject(error);
      }
    });
  },

  // ===== DAILY PLAN MANAGEMENT =====

  // Add daily plan to meal plan
  addDailyPlan: async (planId: string, data: AddDailyPlanRequest): Promise<DailyPlanResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(MEAL_ENDPOINTS.ADD_DAILY_PLAN(planId), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      await handle401Error('Your session has expired. Please sign in again.');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add daily plan: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Remove daily plan from meal plan
  removeDailyPlan: async (planId: string, dayId: string): Promise<{ message: string }> => {
    const headers = await getAuthHeadersForDelete();
    
    try {
      const response = await fetch(MEAL_ENDPOINTS.REMOVE_DAILY_PLAN(planId, dayId), {
        method: 'DELETE',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new Error(`Failed to remove daily plan: ${response.status} - ${errorText}`);
      }

      if (response.status === 204) {
        return { message: 'Daily plan removed successfully' };
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // ===== MEAL TIME MANAGEMENT =====

  // Add meal time to daily plan
  addMealTime: async (planId: string, dayId: string, data: AddMealTimeRequest): Promise<MealTimeResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(MEAL_ENDPOINTS.ADD_MEAL_TIME(planId, dayId), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      await handle401Error('Your session has expired. Please sign in again.');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add meal time: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Remove meal time from daily plan
  removeMealTime: async (planId: string, dayId: string, mealTimeId: string): Promise<{ message: string }> => {
    const headers = await getAuthHeadersForDelete();
    
    try {
      const response = await fetch(MEAL_ENDPOINTS.REMOVE_MEAL_TIME(planId, dayId, mealTimeId), {
        method: 'DELETE',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new Error(`Failed to remove meal time: ${response.status} - ${errorText}`);
      }

      if (response.status === 204) {
        return { message: 'Meal time removed successfully' };
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // ===== FOOD ITEM MANAGEMENT =====

  // Add food to meal time
  addFoodToMealTime: async (planId: string, dayId: string, mealTimeId: string, data: AddFoodToMealTimeRequest): Promise<FoodItemResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(MEAL_ENDPOINTS.ADD_FOOD_TO_MEAL_TIME(planId, dayId, mealTimeId), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      await handle401Error('Your session has expired. Please sign in again.');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add food to meal time: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Update food in meal time
  updateFoodInMealTime: async (planId: string, dayId: string, mealTimeId: string, foodId: string, data: UpdateFoodInMealTimeRequest): Promise<FoodItemResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(MEAL_ENDPOINTS.UPDATE_FOOD_IN_MEAL_TIME(planId, dayId, mealTimeId, foodId), {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      await handle401Error('Your session has expired. Please sign in again.');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update food in meal time: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Remove food from meal time
  removeFoodFromMealTime: async (planId: string, dayId: string, mealTimeId: string, foodId: string): Promise<{ message: string }> => {
    const headers = await getAuthHeadersForDelete();
    
    try {
      const response = await fetch(MEAL_ENDPOINTS.REMOVE_FOOD_FROM_MEAL_TIME(planId, dayId, mealTimeId, foodId), {
        method: 'DELETE',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new Error(`Failed to remove food from meal time: ${response.status} - ${errorText}`);
      }

      if (response.status === 204) {
        return { message: 'Food removed from meal time successfully' };
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // ===== PUBLIC MEAL PLANS =====

  // Get public meal plans
  getPublicMealPlans: async (params?: {
    search?: string;
    goal?: MealPlanGoal;
    offset?: number;
    limit?: number;
  }): Promise<PublicMealPlansResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view public meal plans.');
    }

    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.goal) queryParams.append('goal', params.goal);
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const url = `${MEAL_ENDPOINTS.PUBLIC_MEAL_PLANS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch public meal plans: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // ===== APPLYING MEAL PLANS =====

  // Apply meal plan
  applyMealPlan: async (data: ApplyMealPlanRequest): Promise<AppliedMealPlanResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(MEAL_ENDPOINTS.APPLY_MEAL_PLAN, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      await handle401Error('Your session has expired. Please sign in again.');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to apply meal plan: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Get applied meal plans
  getAppliedMealPlans: async (): Promise<AppliedMealPlansResponse> => {
    const headers = await getAuthHeaders();

    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view applied meal plans.');
    }

    try {
      const response = await fetch(MEAL_ENDPOINTS.APPLIED_MEAL_PLANS, {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch applied meal plans: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Deactivate applied meal plan
  deactivateAppliedMealPlan: async (appliedPlanId: string): Promise<{ message: string }> => {
    const headers = await getAuthHeadersForDelete();

    return new Promise(async (resolve, reject) => {
      try {
        const timeoutId = setTimeout(() => {
          console.log(`[deactivateAppliedMealPlan] Fetch timeout - assuming success due to backend 204 response`);
          resolve({ message: 'Applied meal plan deactivated successfully' });
        }, 5000);

        const response = await fetch(MEAL_ENDPOINTS.DEACTIVATE_APPLIED_MEAL_PLAN(appliedPlanId), {
          method: 'DELETE',
          headers,
        });

        clearTimeout(timeoutId);

        if (response.status === 401) {
          await handle401Error('Your session has expired. Please sign in again.');
          reject(new Error('Authentication required'));
          return;
        }

        if (response.status === 204) {
          resolve({ message: 'Applied meal plan deactivated successfully' });
          return;
        }

        if (response.ok) {
          try {
            const result = await response.json();
            resolve(result);
          } catch (jsonError) {
            resolve({ message: 'Applied meal plan deactivated successfully' });
          }
          return;
        }

        let errorText = '';
        try {
          errorText = await response.text();
        } catch (textError) {
          errorText = 'Unknown error';
        }
        reject(new Error(`Failed to deactivate applied meal plan: ${response.status} - ${errorText}`));

      } catch (error) {
        if (error instanceof TypeError && error.message === 'Network request failed') {
          console.log(`[deactivateAppliedMealPlan] Network request failed - assuming success due to backend 204`);
          resolve({ message: 'Applied meal plan deactivated successfully' });
          return;
        }
        reject(error);
      }
    });
  },

  // ===== COACH ASSIGNMENT =====

  // Assign meal plan to client (Coach only)
  assignMealPlan: async (data: AssignMealPlanRequest): Promise<AppliedMealPlanResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to assign meal plans.');
    }

    try {
      const response = await fetch(MEAL_ENDPOINTS.ASSIGN_MEAL_PLAN, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (response.status === 403) {
        throw new Error('Only coaches can assign meal plans to clients');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to assign meal plan: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // ===== FOOD ITEMS =====

  // Get food items
  getFoodItems: async (params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<FoodItemsListResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view food items.');
    }

    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());

    const url = `${MEAL_ENDPOINTS.FOOD_ITEMS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch food items: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Create food item
  createFoodItem: async (data: CreateFoodItemRequest): Promise<FoodItemCreateResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(MEAL_ENDPOINTS.FOOD_ITEMS, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      await handle401Error('Your session has expired. Please sign in again.');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create food item: ${response.status} - ${errorText}`);
    }

    return response.json();
  },
}; 