import { getAuthHeaders } from './api';

const API_BASE_URL = 'http://52.15.195.49:8000';

// Types for AI Planner
export interface GenerateMealPlanRequest {
  goal?: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance' | 'athletic_performance' | 'general_health';
  days?: number;
  calorie_target?: number;
  dietary_restrictions?: string[];
  meal_times?: string[];
  // New enhanced fitness parameters
  age?: number;
  gender?: 'male' | 'female' | 'not_specified';
  current_weight?: number;
  weight_unit?: 'kg' | 'lbs';
  target_weight?: number;
  height?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  fitness_experience?: 'beginner' | 'intermediate' | 'advanced';
  time_constraints?: string[];
  preferences?: string[];
}

export interface GenerateWorkoutPlanRequest {
  category?: 'strength_training' | 'cardio' | 'flexibility' | 'hiit' | 'yoga' | 'pilates' | 'crossfit' | 'bodyweight' | 'sports' | 'rehabilitation' | 'general_fitness' | 'weight_loss' | 'muscle_gain' | 'endurance' | 'other';
  days?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  focus_areas?: string[];
  equipment?: string[];
  // New enhanced fitness parameters
  age?: number;
  gender?: 'male' | 'female' | 'not_specified';
  current_weight?: number;
  weight_unit?: 'kg' | 'lbs';
  target_weight?: number;
  height?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  fitness_experience?: 'beginner' | 'intermediate' | 'advanced';
  time_constraints?: string[];
  injuries_limitations?: string[];
  workout_preferences?: string[];
}

export interface RegeneratePlanRequest {
  generation_id: string;
  modifications?: Record<string, any>;
}

export interface Generation {
  id: string;
  generation_type: 'meal_plan' | 'workout_plan';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generated_plan_id: string;
  tokens_used: number;
  cost: number | string; // Backend returns cost as string
  processing_time: number;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  template_type: 'meal_plan' | 'workout_plan';
  description: string;
  is_active: boolean;
  variables: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Generate Meal Plan
export const generateMealPlan = async (request: GenerateMealPlanRequest): Promise<{
  message: string;
  meal_plan: any;
  generation: Generation;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/ai-planner/generate-meal-plan/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate meal plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw error;
  }
};

// Generate Workout Plan
export const generateWorkoutPlan = async (request: GenerateWorkoutPlanRequest): Promise<{
  message: string;
  workout_plan: any;
  generation: Generation;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/ai-planner/generate-workout-plan/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate workout plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
};

// Get Generation History
export const getGenerationHistory = async (params?: {
  generation_type?: 'meal_plan' | 'workout_plan';
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  limit?: number;
}): Promise<{
  message: string;
  generations: Generation[];
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.generation_type) queryParams.append('generation_type', params.generation_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_BASE_URL}/api/ai-planner/generations/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch generation history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching generation history:', error);
    throw error;
  }
};

// Get Generation Details
export const getGenerationDetails = async (generationId: string): Promise<{
  message: string;
  generation: Generation & {
    generated_plan: any;
  };
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/ai-planner/generations/${generationId}/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch generation details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching generation details:', error);
    throw error;
  }
};

// Regenerate Plan
export const regeneratePlan = async (request: RegeneratePlanRequest): Promise<{
  message: string;
  plan: any;
  generation: Generation;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/ai-planner/regenerate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to regenerate plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error regenerating plan:', error);
    throw error;
  }
};

// Get AI Plan Templates
export const getAITemplates = async (templateType?: 'meal_plan' | 'workout_plan'): Promise<{
  message: string;
  templates: Template[];
}> => {
  try {
    const queryParams = templateType ? `?template_type=${templateType}` : '';
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/ai-planner/templates/${queryParams}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch templates');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}; 