import { API_ENDPOINTS } from "@/constants/api";
import { getAuthHeaders } from "./api";

// Exercise interfaces
export interface Exercise {
  id: number;
  title: string;
  description: string;
  caloriePerRound: number;
  exerciseIconUrl: string | null;
  exerciseGifUrl: string | null;
}

export interface WorkoutExercise {
  id: number;
  exercise: Exercise;
  set_count: number;
  reps_count: number;
  rest_duration: number;
  calorie: number;
  order: number;
}

// Daily plan interfaces
export interface DailyPlan {
  id: number;
  day: string;
  day_display: string;
  total_calories: number;
  workout_exercises: WorkoutExercise[];
  created_at: string;
  updated_at: string;
}

// Workout plan interfaces
export interface WorkoutPlan {
  id: number;
  title: string;
  description: string;
  client: number;
  client_name: string;
  status: 'draft' | 'published';
  status_display: string;
  total_calories: number;
  daily_plans?: DailyPlan[];
  daily_plans_count?: number;
  created_at: string;
  updated_at: string;
}

// Request/Response interfaces
export interface CreateWorkoutPlanRequest {
  title: string;
  description?: string;
}

export interface UpdateWorkoutPlanRequest {
  title?: string;
  description?: string;
  status?: 'draft' | 'published';
}

export interface AddDayRequest {
  day: 'day1' | 'day2' | 'day3' | 'day4' | 'day5' | 'day6' | 'day7';
}

export interface AddExerciseRequest {
  exercise_id: number;
  set_count: number;
  reps_count: number;
  rest_duration: number;
  order?: number;
}

export interface UpdateExerciseRequest {
  set_count?: number;
  reps_count?: number;
  rest_duration?: number;
  order?: number;
}

// API Response interfaces
export interface WorkoutPlanResponse {
  message: string;
  workout_plan: WorkoutPlan;
}

export interface WorkoutPlansListResponse {
  message: string;
  workout_plans: WorkoutPlan[];
}

export interface DailyPlanResponse {
  message: string;
  daily_plan: DailyPlan;
}

export interface ExerciseResponse {
  message: string;
  exercise: WorkoutExercise;
}

export interface ExercisesListResponse {
  message: string;
  exercises: Exercise[];
  totalExercisesCount: number;
}

// WorkoutService class
export const WorkoutService = {
  // Get all workout plans
  getWorkoutPlans: async (): Promise<WorkoutPlansListResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.WORKOUT_PLANS, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch workout plans: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Get specific workout plan
  getWorkoutPlan: async (planId: number): Promise<WorkoutPlanResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.WORKOUT_PLAN_DETAILS(planId), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch workout plan: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Create new workout plan
  createWorkoutPlan: async (data: CreateWorkoutPlanRequest): Promise<WorkoutPlanResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.WORKOUT_PLANS, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create workout plan: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Update workout plan
  updateWorkoutPlan: async (planId: number, data: UpdateWorkoutPlanRequest): Promise<WorkoutPlanResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.WORKOUT_PLAN_DETAILS(planId), {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update workout plan: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Delete workout plan
  deleteWorkoutPlan: async (planId: number): Promise<{ message: string }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.WORKOUT_PLAN_DETAILS(planId), {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete workout plan: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Add day to workout plan
  addDay: async (planId: number, data: AddDayRequest): Promise<DailyPlanResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.ADD_DAY(planId), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add day: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Remove day from workout plan
  removeDay: async (planId: number, dayId: number): Promise<{ message: string }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.REMOVE_DAY(planId, dayId), {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to remove day: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Add exercise to day
  addExercise: async (planId: number, dayId: number, data: AddExerciseRequest): Promise<ExerciseResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.ADD_EXERCISE(planId, dayId), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add exercise: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Update exercise in day
  updateExercise: async (planId: number, dayId: number, exerciseId: number, data: UpdateExerciseRequest): Promise<ExerciseResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.UPDATE_EXERCISE(planId, dayId, exerciseId), {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update exercise: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Remove exercise from day
  removeExercise: async (planId: number, dayId: number, exerciseId: number): Promise<{ message: string }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.REMOVE_EXERCISE(planId, dayId, exerciseId), {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to remove exercise: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Get available exercises
  getExercises: async (): Promise<ExercisesListResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.EXERCISES.GET_ALL, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch exercises: ${response.status} - ${errorText}`);
    }

    return response.json();
  },
}; 