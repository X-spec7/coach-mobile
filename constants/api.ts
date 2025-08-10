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
    COACHES: `${API_BASE_URL}/users/coaches/`,
    COACH_CLIENT_RELATIONSHIP: `${API_BASE_URL}/users/coach-client-relationship/`,
    MY_RELATIONSHIPS: `${API_BASE_URL}/users/my-relationships/`,
    COACH_CLIENT_RELATIONSHIP_DETAILS: (relationshipId: string) => `${API_BASE_URL}/users/coach-client-relationship/${relationshipId}/`,
  },
  CLIENT_USER: {
    GET_USER_INFO: `${API_BASE_URL}/users/client/profile/`,
    UPDATE_USER_INFO: `${API_BASE_URL}/users/client/profile/`,
  },
  WORKOUTS: {
    WORKOUT_PLANS: `${API_BASE_URL}/workouts/workout-plans/`,
    WORKOUT_PLAN_DETAILS: (planId: number) => `${API_BASE_URL}/workouts/workout-plans/${planId}/`,
    ADD_DAY: (planId: number) => `${API_BASE_URL}/workouts/workout-plans/${planId}/days/`,
    REMOVE_DAY: (planId: number, dayId: number) => `${API_BASE_URL}/workouts/workout-plans/${planId}/days/${dayId}/`,
    ADD_EXERCISE: (planId: number, dayId: number) => `${API_BASE_URL}/workouts/workout-plans/${planId}/days/${dayId}/exercises/`,
    UPDATE_EXERCISE: (planId: number, dayId: number, exerciseId: number) => `${API_BASE_URL}/workouts/workout-plans/${planId}/days/${dayId}/exercises/${exerciseId}/`,
    REMOVE_EXERCISE: (planId: number, dayId: number, exerciseId: number) => `${API_BASE_URL}/workouts/workout-plans/${planId}/days/${dayId}/exercises/${exerciseId}/`,
    
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
};