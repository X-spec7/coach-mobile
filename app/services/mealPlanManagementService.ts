import { getAuthHeaders } from './api';

const API_BASE_URL = 'http://52.15.195.49:8000';

// Types for Meal Plan Management
export type MealPlanGoal = 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance' | 'athletic_performance' | 'general_health';

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

export interface DailyPlan {
  id: string;
  day: string;
  day_display: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_times: MealTime[];
}

export interface MealTime {
  id: string;
  name: string;
  time: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  food_items: FoodItem[];
}

export interface FoodItem {
  id: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  fats: number;
  carb: number;
  order: number;
  food_item_details: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    total_carbohydrates: number;
    total_fat: number;
  };
}

export interface FoodItemSearch {
  id: string;
  name: string;
  calories: number;
  protein: number;
  total_carbohydrates: number;
  total_fat: number;
  serving_size: number;
  serving_unit: string;
}

export interface AppliedMealPlan {
  id: string;
  meal_plan: MealPlan;
  selected_days: string[];
  weeks_count: number;
  start_date: string;
  is_active: boolean;
  source: string;
}

// Get all meal plans (including AI-generated drafts)
export const getMealPlans = async (): Promise<{
  message: string;
  meal_plans: MealPlan[];
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch meal plans');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    throw error;
  }
};

// Get meal plan details
export const getMealPlanDetails = async (planId: string): Promise<{
  message: string;
  meal_plan: MealPlan;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${planId}/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch meal plan details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching meal plan details:', error);
    throw error;
  }
};

// Update meal plan basic info
export const updateMealPlan = async (planId: string, updates: {
  title?: string;
  description?: string;
  goal?: string;
  status?: 'draft' | 'published';
  is_public?: boolean;
}): Promise<{
  message: string;
  meal_plan: MealPlan;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${planId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update meal plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating meal plan:', error);
    throw error;
  }
};

// Add daily plan
export const addDailyPlan = async (planId: string, day: string): Promise<{
  message: string;
  daily_plan: DailyPlan;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${planId}/days/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ day }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add daily plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding daily plan:', error);
    throw error;
  }
};

// Delete daily plan
export const deleteDailyPlan = async (planId: string, dayId: string): Promise<{
  message: string;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${planId}/days/${dayId}/`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete daily plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting daily plan:', error);
    throw error;
  }
};

// Add meal time
export const addMealTime = async (planId: string, dayId: string, mealTime: {
  name: string;
  time: string;
}): Promise<{
  message: string;
  meal_time: MealTime;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${planId}/days/${dayId}/meal-times/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(mealTime),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add meal time');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding meal time:', error);
    throw error;
  }
};

// Delete meal time
export const deleteMealTime = async (planId: string, dayId: string, mealTimeId: string): Promise<{
  message: string;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${planId}/days/${dayId}/meal-times/${mealTimeId}/`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete meal time');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting meal time:', error);
    throw error;
  }
};

// Add food item to meal
export const addFoodItem = async (planId: string, dayId: string, mealTimeId: string, foodItem: {
  food_item_id: string;
  amount: number;
  unit: string;
}): Promise<{
  message: string;
  food_item: FoodItem;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${planId}/days/${dayId}/meal-times/${mealTimeId}/foods/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(foodItem),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add food item');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding food item:', error);
    throw error;
  }
};

// Remove food item from meal
export const removeFoodItem = async (planId: string, dayId: string, mealTimeId: string, foodItemId: string): Promise<{
  message: string;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${planId}/days/${dayId}/meal-times/${mealTimeId}/foods/${foodItemId}/`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove food item');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing food item:', error);
    throw error;
  }
};

// Apply meal plan
export const applyMealPlan = async (planId: string, schedule: {
  selected_days: string[];
  weeks_count: number;
  start_date: string;
}): Promise<{
  message: string;
  applied_plan: AppliedMealPlan;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/apply-meal-plan/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        meal_plan_id: planId,
        ...schedule,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to apply meal plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error applying meal plan:', error);
    throw error;
  }
};

// Get applied meal plans
export const getAppliedMealPlans = async (): Promise<{
  message: string;
  applied_plans: AppliedMealPlan[];
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/applied-meal-plans/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch applied meal plans');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching applied meal plans:', error);
    throw error;
  }
};

// Search food items
export const searchFoodItems = async (search?: string, limit?: number): Promise<{
  message: string;
  food_items: FoodItemSearch[];
}> => {
  try {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/meal-plans/food-items/?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to search food items');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching food items:', error);
    throw error;
  }
};