import { getAuthHeaders } from './api';
import { handle401Error } from '../utils/auth';

// Hardcoded API base URL and endpoints to bypass TypeScript caching issues
const API_BASE_URL = 'http://52.15.195.49:8000';

const TRACKING_ENDPOINTS = {
  SCHEDULED_MEALS: `${API_BASE_URL}/api/mealplan/scheduled-meals/`,
  SCHEDULED_MEAL_DETAILS: (mealId: string) => `${API_BASE_URL}/api/mealplan/scheduled-meals/${mealId}/`,
  LOG_FOOD: (mealId: string) => `${API_BASE_URL}/api/mealplan/scheduled-meals/${mealId}/log-food/`,
  CONSUMED_FOOD_DETAILS: (consumedFoodId: string) => `${API_BASE_URL}/api/mealplan/consumed-foods/${consumedFoodId}/`,
  UPDATE_CONSUMED_FOOD: (consumedFoodId: string) => `${API_BASE_URL}/api/mealplan/consumed-foods/${consumedFoodId}/`,
  DELETE_CONSUMED_FOOD: (consumedFoodId: string) => `${API_BASE_URL}/api/mealplan/consumed-foods/${consumedFoodId}/`,
  TRACKING_STATS: `${API_BASE_URL}/api/mealplan/tracking-stats/`,
};

// Type definitions
export type ConsumptionUnit = 'gram' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp';

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItemDetails {
  id: string;
  name: string;
  calories: number;
  serving_size: number;
  serving_unit: string;
}

export interface PlannedFoodItem {
  id: string;
  food_item_details: FoodItemDetails;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ConsumedFood {
  id: string;
  meal_plan_food_item: string;
  food_item_details: FoodItemDetails;
  consumed_amount: number;
  consumed_unit: ConsumptionUnit;
  planned_amount: number;
  planned_unit: ConsumptionUnit;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  notes?: string;
  completion_percentage: number;
  is_fully_consumed: boolean;
  created_at: string;
}

export interface ScheduledMeal {
  id: string;
  meal_time_name: string;
  meal_time_time: string;
  daily_plan_day: string;
  scheduled_date: string;
  week_number: number;
  is_completed: boolean;
  completed_at?: string | null;
  completion_percentage: number;
  consumed_foods_count: number;
  total_foods_count: number;
}

export interface ScheduledMealDetails {
  id: string;
  daily_plan: string;
  meal_time: string;
  meal_time_name: string;
  meal_time_time: string;
  daily_plan_day: string;
  scheduled_date: string;
  week_number: number;
  is_completed: boolean;
  completed_at?: string | null;
  completion_percentage: number;
  consumed_calories: number;
  consumed_nutrition: NutritionInfo;
  planned_nutrition: NutritionInfo;
  consumed_foods: ConsumedFood[];
  planned_foods: PlannedFoodItem[];
  created_at: string;
}

export interface LogFoodRequest {
  meal_plan_food_item_id: string;
  consumed_amount: number;
  consumed_unit: ConsumptionUnit;
  notes?: string;
}

export interface UpdateConsumedFoodRequest {
  consumed_amount?: number;
  consumed_unit?: ConsumptionUnit;
  notes?: string;
}

export interface TrackingStats {
  date_range: {
    from: string;
    to: string;
  };
  meal_completion: {
    total_meals: number;
    completed_meals: number;
    completion_rate: number;
  };
  nutrition_comparison: {
    consumed: NutritionInfo;
    planned: NutritionInfo;
    adherence_percentage: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
}

// API Response interfaces
export interface ScheduledMealsResponse {
  message: string;
  scheduled_meals: ScheduledMeal[];
  total: number;
}

export interface ScheduledMealDetailsResponse {
  message: string;
  scheduled_meal: ScheduledMealDetails;
}

export interface LogFoodResponse {
  message: string;
  consumed_food: ConsumedFood;
}

export interface ConsumedFoodResponse {
  message: string;
  consumed_food: ConsumedFood;
}

export interface UpdateConsumedFoodResponse {
  message: string;
  consumed_food: ConsumedFood;
}

export interface DeleteConsumedFoodResponse {
  message: string;
}

export interface TrackingStatsResponse {
  message: string;
  date_range: TrackingStats['date_range'];
  meal_completion: TrackingStats['meal_completion'];
  nutrition_comparison: TrackingStats['nutrition_comparison'];
}

// MealTrackingService
export const MealTrackingService = {
  // ===== SCHEDULED MEALS =====

  // Get user's scheduled meals
  getScheduledMeals: async (params?: {
    date_from?: string;
    date_to?: string;
    is_completed?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ScheduledMealsResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view scheduled meals.');
    }

    try {
      const queryParams = new URLSearchParams();
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);
      if (params?.is_completed !== undefined) queryParams.append('is_completed', params.is_completed.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const url = `${TRACKING_ENDPOINTS.SCHEDULED_MEALS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
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
        throw new Error(`Failed to fetch scheduled meals: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Get scheduled meal details
  getScheduledMealDetails: async (mealId: string): Promise<ScheduledMealDetailsResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view meal details.');
    }

    try {
      const response = await fetch(TRACKING_ENDPOINTS.SCHEDULED_MEAL_DETAILS(mealId), {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch meal details: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // ===== FOOD CONSUMPTION LOGGING =====

  // Log food consumption
  logFoodConsumption: async (mealId: string, data: LogFoodRequest): Promise<LogFoodResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to log food consumption.');
    }

    try {
      const response = await fetch(TRACKING_ENDPOINTS.LOG_FOOD(mealId), {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to log food consumption: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // ===== CONSUMED FOOD MANAGEMENT =====

  // Get consumed food details
  getConsumedFoodDetails: async (consumedFoodId: string): Promise<ConsumedFoodResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view consumed food details.');
    }

    try {
      const response = await fetch(TRACKING_ENDPOINTS.CONSUMED_FOOD_DETAILS(consumedFoodId), {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch consumed food details: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Update consumed food
  updateConsumedFood: async (consumedFoodId: string, data: UpdateConsumedFoodRequest): Promise<UpdateConsumedFoodResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to update food consumption.');
    }

    try {
      const response = await fetch(TRACKING_ENDPOINTS.UPDATE_CONSUMED_FOOD(consumedFoodId), {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update food consumption: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Delete consumed food record
  deleteConsumedFood: async (consumedFoodId: string): Promise<DeleteConsumedFoodResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to delete food consumption record.');
    }

    try {
      const response = await fetch(TRACKING_ENDPOINTS.DELETE_CONSUMED_FOOD(consumedFoodId), {
        method: 'DELETE',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete food consumption record: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // ===== TRACKING STATISTICS =====

  // Get meal tracking statistics
  getTrackingStats: async (params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<TrackingStatsResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view tracking statistics.');
    }

    try {
      const queryParams = new URLSearchParams();
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const url = `${TRACKING_ENDPOINTS.TRACKING_STATS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
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
        throw new Error(`Failed to fetch tracking statistics: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },
};