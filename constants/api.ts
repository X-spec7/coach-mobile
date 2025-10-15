// API Configuration with environment-specific fallbacks
const getApiBaseUrl = () => {
  // First, check for environment variable
  if (process.env.EXPO_PUBLIC_BASE_URL) {
    return process.env.EXPO_PUBLIC_BASE_URL;
  }

  // For Android emulator, use the remote server IP
  // For physical devices, you may need to check network accessibility
  return "http://52.15.195.49:8000/api";
};

const getWsBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_WS_BASE_URL) {
    return process.env.EXPO_PUBLIC_WS_BASE_URL;
  }
  return "ws://52.15.195.49:8000";
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWsBaseUrl();

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/authentication/login/`,
    LOGOUT: `${API_BASE_URL}/authentication/logout/`,
    REGISTER: `${API_BASE_URL}/authentication/register/`,
    VERIFY_CODE: `${API_BASE_URL}/authentication/verify-code/`,
    VERIFY_EMAIL: `${API_BASE_URL}/authentication/verify-code/`,
    RESEND_CODE: `${API_BASE_URL}/authentication/resend-code/`,
    RESEND_VERIFICATION: `${API_BASE_URL}/authentication/resend-code/`,
  },
  ONBOARDING: {
    GET_INTERESTS: `${API_BASE_URL}/onboarding/interests/`,
    GET_HELP_OPTIONS: `${API_BASE_URL}/onboarding/help-options/`,
  },
  USER: {
    GET_USER_INFO: `${API_BASE_URL}/users/profile/`,
    SELECT_MEAL_PLAN: `${API_BASE_URL}/users/select-meal-plan/`,
  },
  USERS: {
    USERS_LIST: `${API_BASE_URL}/users/`,
    COACHES: `${API_BASE_URL}/users/coaches-list/`,
    CLIENTS_LIST: `${API_BASE_URL}/users/clients-list/`,
    COACH_CLIENT_RELATIONSHIP: `${API_BASE_URL}/users/coach-client-relationship/`,
    MY_RELATIONSHIPS: `${API_BASE_URL}/users/relationships/`,
    COACH_CLIENT_RELATIONSHIP_DETAILS: (relationshipId: string) => `${API_BASE_URL}/users/coach-client-relationship/${relationshipId}/`,
  },
  PROFILE: {
    GET_PROFILE: `${API_BASE_URL}/users/profile/`,
    UPDATE_CLIENT: `${API_BASE_URL}/users/client/update/`,
    UPDATE_COACH: `${API_BASE_URL}/users/coach/update/`,
    GET_CLIENT_PROFILE: `${API_BASE_URL}/users/client/profile/`,
    UPDATE_CLIENT_PROFILE: `${API_BASE_URL}/users/client/profile/`,
  },
  CLIENT_USER: {
    GET_USER_INFO: `${API_BASE_URL}/users/client/profile/`,
    UPDATE_USER_INFO: `${API_BASE_URL}/users/client/profile/`,
  },
  WEIGHT_TRACKING: {
    CREATE: `${API_BASE_URL}/weight-tracking/create/`,
    UPDATE: (entryId: string) => `${API_BASE_URL}/weight-tracking/${entryId}/update/`,
    DELETE: (entryId: string) => `${API_BASE_URL}/weight-tracking/${entryId}/delete/`,
    GET_ENTRY: (entryId: string) => `${API_BASE_URL}/weight-tracking/${entryId}/`,
    HISTORY: `${API_BASE_URL}/weight-tracking/history/`,
    LATEST: `${API_BASE_URL}/weight-tracking/latest/`,
  },
  SESSIONS: {
    CREATE: `${API_BASE_URL}/session/create/`,
    GET_ALL: `${API_BASE_URL}/session/get/`,
    GET_COUNT: `${API_BASE_URL}/session/get/count/`,
    GET_MINE: `${API_BASE_URL}/session/get/mine/`,
    GET_MINE_COUNT: `${API_BASE_URL}/session/get/mine/count/`,
    BOOK: `${API_BASE_URL}/session/book/`,
    JOIN: `${API_BASE_URL}/session/join/`,
  },
  WORKOUTS: {
    WORKOUT_PLANS: `${API_BASE_URL}/workouts/workout-plans/`,
    WORKOUT_PLAN_DETAILS: (planId: string) => `${API_BASE_URL}/workouts/workout-plans/${planId}/`,
    TOGGLE_WORKOUT_PLAN_VISIBILITY: (planId: string) => `${API_BASE_URL}/workouts/workout-plans/${planId}/toggle-visibility/`,
    ADD_DAY: (planId: string) => `${API_BASE_URL}/workouts/workout-plans/${planId}/days/`,
    REMOVE_DAY: (planId: string, dayId: number) => `${API_BASE_URL}/workouts/workout-plans/${planId}/days/${dayId}/`,
    ADD_EXERCISE: (planId: string, dayId: number) => `${API_BASE_URL}/workouts/workout-plans/${planId}/days/${dayId}/exercises/`,
    UPDATE_EXERCISE: (planId: string, dayId: number, exerciseId: number) => `${API_BASE_URL}/workouts/workout-plans/${planId}/days/${dayId}/exercises/${exerciseId}/`,
    REMOVE_EXERCISE: (planId: string, dayId: number, exerciseId: number) => `${API_BASE_URL}/workouts/workout-plans/${planId}/days/${dayId}/exercises/${exerciseId}/`,
    
    // Public workout plans
    PUBLIC_WORKOUT_PLANS: `${API_BASE_URL}/workouts/public-workout-plans/`,
    APPLY_WORKOUT_PLAN: `${API_BASE_URL}/workouts/apply-workout-plan/`,
    
    // Applied workout plans
    APPLIED_WORKOUT_PLANS: `${API_BASE_URL}/workouts/applied-workout-plans/`,
    APPLIED_WORKOUT_PLAN_DETAILS: (appliedPlanId: number) => `${API_BASE_URL}/workouts/applied-workout-plans/${appliedPlanId}/`,
    DEACTIVATE_APPLIED_PLAN: (appliedPlanId: number) => `${API_BASE_URL}/workouts/applied-workout-plans/${appliedPlanId}/`,
    
    // Scheduled workouts
    SCHEDULED_WORKOUTS: `${API_BASE_URL}/workouts/scheduled-workouts/`,
    SCHEDULED_WORKOUT_DETAILS: (scheduledWorkoutId: number) => `${API_BASE_URL}/workouts/scheduled-workouts/${scheduledWorkoutId}/`,
    EXERCISE_PROGRESS: (scheduledWorkoutId: number) => `${API_BASE_URL}/workouts/scheduled-workouts/${scheduledWorkoutId}/progress/`,
    UNCOMPLETE_EXERCISE: (scheduledWorkoutId: number, workoutExerciseId: number) => `${API_BASE_URL}/workouts/scheduled-workouts/${scheduledWorkoutId}/exercises/${workoutExerciseId}/uncomplete/`,
    
    // Exercise completion
    COMPLETE_EXERCISE: `${API_BASE_URL}/workouts/complete-exercise/`,
    COMPLETE_WORKOUT: `${API_BASE_URL}/workouts/complete-workout/`,
    
    // Workout plan assignment
    ASSIGN_WORKOUT_PLAN: `${API_BASE_URL}/workouts/assign-workout-plan/`,
    WORKOUT_PLAN_ASSIGNMENTS: `${API_BASE_URL}/workouts/workout-plan-assignments/`,
    ACCEPT_WORKOUT_ASSIGNMENT: `${API_BASE_URL}/workouts/accept-workout-assignment/`,
    REJECT_WORKOUT_ASSIGNMENT: (assignmentId: string) => `${API_BASE_URL}/workouts/reject-workout-assignment/${assignmentId}/`,
  },
  EXERCISES: {
    GET_ALL: `${API_BASE_URL}/exercises/`,
    CREATE: `${API_BASE_URL}/exercises/`,
    UPDATE: `${API_BASE_URL}/exercises/update/`,
    DELETE: (exerciseId: number) => `${API_BASE_URL}/exercises/${exerciseId}/`,
  },
  CALORIE_TRACKING: {
    GOALS: `${API_BASE_URL}/calorie-tracking/goals/`,
    DAILY_LOGS: `${API_BASE_URL}/calorie-tracking/daily-logs/`,
    FOOD_ENTRIES: `${API_BASE_URL}/calorie-tracking/food-entries/`,
    FOOD_ENTRY_DETAILS: (entryId: string) => `${API_BASE_URL}/calorie-tracking/food-entries/${entryId}/`,
    SEARCH_FOOD: `${API_BASE_URL}/calorie-tracking/search-food/`,
    CUSTOM_FOODS: `${API_BASE_URL}/calorie-tracking/custom-foods/`,
    CUSTOM_FOOD_DETAILS: (foodId: string) => `${API_BASE_URL}/calorie-tracking/custom-foods/${foodId}/`,
    QUICK_ADD: `${API_BASE_URL}/calorie-tracking/quick-add/`,
    STATS: `${API_BASE_URL}/calorie-tracking/stats/`,
  },
};