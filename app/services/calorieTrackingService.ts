import { getAuthHeaders } from './api';
import { handle401Error } from '../utils/auth';

// Hardcoded API base URL to bypass TypeScript caching issues
const API_BASE_URL = 'http://52.15.195.49:8000';

const CALORIE_TRACKING_ENDPOINTS = {
  GOALS: `${API_BASE_URL}/api/calorie-tracking/goals/`,
  DAILY_LOGS: `${API_BASE_URL}/api/calorie-tracking/daily-logs/`,
  FOOD_ENTRIES: `${API_BASE_URL}/api/calorie-tracking/food-entries/`,
  FOOD_ENTRY_DETAILS: (entryId: string) => `${API_BASE_URL}/api/calorie-tracking/food-entries/${entryId}/`,
  SEARCH_FOOD: `${API_BASE_URL}/api/calorie-tracking/search-food/`,
  CUSTOM_FOODS: `${API_BASE_URL}/api/calorie-tracking/custom-foods/`,
  CUSTOM_FOOD_DETAILS: (foodId: string) => `${API_BASE_URL}/api/calorie-tracking/custom-foods/${foodId}/`,
  QUICK_ADD: `${API_BASE_URL}/api/calorie-tracking/quick-add/`,
  STATS: `${API_BASE_URL}/api/calorie-tracking/stats/`,
};

// Type definitions
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
export type ConsumptionUnit = 'gram' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp' | 'slice' | 'medium' | 'large' | 'small';

export interface CalorieGoal {
  id: string;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  consumed: number;
  goal: number;
  remaining: number;
  percentage: number;
}

export interface DailyGoalProgress {
  calories: GoalProgress;
  protein: GoalProgress;
  carbs: GoalProgress;
  fat: GoalProgress;
}

export interface FoodItemDetails {
  id: string;
  name: string;
  calories: number;
  protein: number;
  total_carbohydrates: number;
  total_fat: number;
  serving_size: number;
  serving_unit: string;
}

export interface CustomFood {
  id: string;
  name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_favorite: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FoodEntry {
  id: string;
  food_item_details: FoodItemDetails;
  amount: number;
  unit: string;
  meal_type: MealType;
  consumed_at: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  created_at: string;
}

export interface DailyLog {
  id: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  notes?: string;
  goal_progress: DailyGoalProgress;
  food_entries: FoodEntry[];
  created_at: string;
  updated_at: string;
}

export interface FoodSearchResult {
  database_foods: FoodItemDetails[];
  custom_foods: CustomFood[];
}

export interface CreateGoalRequest {
  daily_calories: number;
  daily_protein?: number;
  daily_carbs?: number;
  daily_fat?: number;
  is_active?: boolean;
}

export interface AddFoodEntryRequest {
  food_item_id?: string;
  custom_food_id?: string;
  amount: number;
  unit: string;
  meal_type: MealType;
  consumed_at?: string;
  notes?: string;
}

export interface UpdateFoodEntryRequest {
  amount?: number;
  unit?: string;
  meal_type?: MealType;
  consumed_at?: string;
  notes?: string;
}

export interface CreateCustomFoodRequest {
  name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_favorite?: boolean;
  notes?: string;
}

export interface UpdateCustomFoodRequest {
  name?: string;
  serving_size?: number;
  serving_unit?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  is_favorite?: boolean;
  notes?: string;
}

export interface QuickAddRequest {
  name: string;
  calories: number;
  amount: number;
  unit: string;
  meal_type: MealType;
  consumed_at?: string;
  notes?: string;
}

export interface MealTypeBreakdown {
  count: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export interface GoalAdherence {
  goal: number;
  average_consumed: number;
  adherence_percentage: number;
}

export interface CalorieStats {
  date_from: string;
  date_to: string;
  total_days: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  average_calories_per_day: number;
  average_protein_per_day: number;
  average_carbs_per_day: number;
  average_fat_per_day: number;
  goal_adherence: {
    calories: GoalAdherence;
    protein: GoalAdherence;
    carbs: GoalAdherence;
    fat: GoalAdherence;
  };
  meal_type_breakdown: {
    breakfast: MealTypeBreakdown;
    lunch: MealTypeBreakdown;
    dinner: MealTypeBreakdown;
    snack: MealTypeBreakdown;
  };
}

// API Functions
export const getCalorieGoals = async (): Promise<{ message: string; goal: CalorieGoal | null }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.GOALS, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      await handle401Error();
      return { message: 'Unauthorized', goal: null };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching calorie goals:', error);
    throw error;
  }
};

export const createUpdateCalorieGoals = async (goalData: CreateGoalRequest): Promise<{ message: string; goal: CalorieGoal }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.GOALS, {
      method: 'POST',
      headers,
      body: JSON.stringify(goalData),
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating/updating calorie goals:', error);
    throw error;
  }
};

export const getDailyLogs = async (params?: {
  date?: string;
  date_from?: string;
  date_to?: string;
}): Promise<{ message: string; logs: DailyLog[] }> => {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    
    if (params?.date) queryParams.append('date', params.date);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const url = `${CALORIE_TRACKING_ENDPOINTS.DAILY_LOGS}?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      await handle401Error();
      return { message: 'Unauthorized', logs: [] };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    throw error;
  }
};

export const addFoodEntry = async (entryData: AddFoodEntryRequest): Promise<{ message: string; food_entry: FoodEntry }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.FOOD_ENTRIES, {
      method: 'POST',
      headers,
      body: JSON.stringify(entryData),
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding food entry:', error);
    throw error;
  }
};

export const getFoodEntryDetails = async (entryId: string): Promise<{ message: string; food_entry: FoodEntry }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.FOOD_ENTRY_DETAILS(entryId), {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching food entry details:', error);
    throw error;
  }
};

export const updateFoodEntry = async (entryId: string, updateData: UpdateFoodEntryRequest): Promise<{ message: string; food_entry: FoodEntry }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.FOOD_ENTRY_DETAILS(entryId), {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData),
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating food entry:', error);
    throw error;
  }
};

export const deleteFoodEntry = async (entryId: string): Promise<{ message: string }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.FOOD_ENTRY_DETAILS(entryId), {
      method: 'DELETE',
      headers,
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting food entry:', error);
    throw error;
  }
};

export const searchFood = async (params?: {
  query?: string;
  limit?: number;
  include_custom?: boolean;
  include_favorites?: boolean;
}): Promise<{ message: string; results: FoodSearchResult }> => {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    
    if (params?.query) queryParams.append('query', params.query);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.include_custom !== undefined) queryParams.append('include_custom', params.include_custom.toString());
    if (params?.include_favorites !== undefined) queryParams.append('include_favorites', params.include_favorites.toString());

    const url = `${CALORIE_TRACKING_ENDPOINTS.SEARCH_FOOD}?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      await handle401Error();
      return { message: 'Unauthorized', results: { database_foods: [], custom_foods: [] } };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching food:', error);
    throw error;
  }
};

export const getCustomFoods = async (): Promise<{ message: string; custom_foods: CustomFood[] }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.CUSTOM_FOODS, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      await handle401Error();
      return { message: 'Unauthorized', custom_foods: [] };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching custom foods:', error);
    throw error;
  }
};

export const createCustomFood = async (foodData: CreateCustomFoodRequest): Promise<{ message: string; custom_food: CustomFood }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.CUSTOM_FOODS, {
      method: 'POST',
      headers,
      body: JSON.stringify(foodData),
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating custom food:', error);
    throw error;
  }
};

export const getCustomFoodDetails = async (foodId: string): Promise<{ message: string; custom_food: CustomFood }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.CUSTOM_FOOD_DETAILS(foodId), {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching custom food details:', error);
    throw error;
  }
};

export const updateCustomFood = async (foodId: string, updateData: UpdateCustomFoodRequest): Promise<{ message: string; custom_food: CustomFood }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.CUSTOM_FOOD_DETAILS(foodId), {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData),
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating custom food:', error);
    throw error;
  }
};

export const deleteCustomFood = async (foodId: string): Promise<{ message: string }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.CUSTOM_FOOD_DETAILS(foodId), {
      method: 'DELETE',
      headers,
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting custom food:', error);
    throw error;
  }
};

export const quickAddFood = async (foodData: QuickAddRequest): Promise<{ message: string; food_entry: FoodEntry }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(CALORIE_TRACKING_ENDPOINTS.QUICK_ADD, {
      method: 'POST',
      headers,
      body: JSON.stringify(foodData),
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error quick adding food:', error);
    throw error;
  }
};

export const getCalorieStats = async (params?: {
  date_from?: string;
  date_to?: string;
}): Promise<{ message: string; stats: CalorieStats }> => {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const url = `${CALORIE_TRACKING_ENDPOINTS.STATS}?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      await handle401Error();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching calorie stats:', error);
    throw error;
  }
}; 