// Base URLs
export const API_BASE_URL = 'http://52.15.195.49:8000';

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login/`,
    REGISTER: `${API_BASE_URL}/api/auth/register/`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout/`,
    REFRESH: `${API_BASE_URL}/api/auth/token/refresh/`,
  },

  // User endpoints
  USERS: {
    PROFILE: `${API_BASE_URL}/api/users/profile/`,
    COACHES: `${API_BASE_URL}/api/users/`, // Use general users endpoint with filter
    USERS_LIST: `${API_BASE_URL}/api/users/`, // Use general users endpoint
    COACH_CLIENT_RELATIONSHIP: `${API_BASE_URL}/api/users/relationships/`,
    COACH_CLIENT_RELATIONSHIP_DETAILS: (id: number) => `${API_BASE_URL}/api/users/relationships/${id}/`,
  },

  // Workout endpoints
  WORKOUTS: {
    WORKOUT_PLANS: `${API_BASE_URL}/api/workouts/workout-plans/`,
    WORKOUT_PLAN_DETAILS: (id: number) => `${API_BASE_URL}/api/workouts/workout-plans/${id}/`,
    ADD_DAY: (planId: number) => `${API_BASE_URL}/api/workouts/workout-plans/${planId}/days/`,
    REMOVE_DAY: (planId: number, dayId: number) => `${API_BASE_URL}/api/workouts/workout-plans/${planId}/days/${dayId}/`,
    ADD_EXERCISE: (planId: number, dayId: number) => `${API_BASE_URL}/api/workouts/workout-plans/${planId}/days/${dayId}/exercises/`,
    UPDATE_EXERCISE: (planId: number, dayId: number, exerciseId: number) => `${API_BASE_URL}/api/workouts/workout-plans/${planId}/days/${dayId}/exercises/${exerciseId}/`,
    REMOVE_EXERCISE: (planId: number, dayId: number, exerciseId: number) => `${API_BASE_URL}/api/workouts/workout-plans/${planId}/days/${dayId}/exercises/${exerciseId}/`,
    
    // Public and Applied Workout Plans
    PUBLIC_WORKOUT_PLANS: `${API_BASE_URL}/api/workouts/public-workout-plans/`,
    APPLY_WORKOUT_PLAN: `${API_BASE_URL}/api/workouts/apply-workout-plan/`,
    APPLIED_WORKOUT_PLANS: `${API_BASE_URL}/api/workouts/applied-workout-plans/`,
    APPLIED_WORKOUT_PLAN_DETAILS: (id: number) => `${API_BASE_URL}/api/workouts/applied-workout-plans/${id}/`,
    DEACTIVATE_APPLIED_PLAN: (id: number) => `${API_BASE_URL}/api/workouts/applied-workout-plans/${id}/deactivate/`,
    
    // Scheduled Workouts
    SCHEDULED_WORKOUTS: `${API_BASE_URL}/api/workouts/scheduled-workouts/`,
    SCHEDULED_WORKOUT_DETAILS: (id: number) => `${API_BASE_URL}/api/workouts/scheduled-workouts/${id}/`,
    
    // Exercise Completion
    COMPLETE_EXERCISE: `${API_BASE_URL}/api/workouts/complete-exercise/`,
    UNCOMPLETE_EXERCISE: (scheduledWorkoutId: number, workoutExerciseId: number) => `${API_BASE_URL}/api/workouts/scheduled-workouts/${scheduledWorkoutId}/exercises/${workoutExerciseId}/uncomplete/`,
    EXERCISE_PROGRESS: (scheduledWorkoutId: number) => `${API_BASE_URL}/api/workouts/scheduled-workouts/${scheduledWorkoutId}/exercise-progress/`,
    COMPLETE_WORKOUT: `${API_BASE_URL}/api/workouts/complete-workout/`,

    // Coach-Client Workout Assignments (These may not exist in backend yet)
    ASSIGN_WORKOUT_PLAN: `${API_BASE_URL}/api/workouts/assign-workout-plan/`,
    WORKOUT_PLAN_ASSIGNMENTS: `${API_BASE_URL}/api/workouts/workout-plan-assignments/`,
    ACCEPT_WORKOUT_ASSIGNMENT: `${API_BASE_URL}/api/workouts/accept-workout-plan-assignment/`,
    REJECT_WORKOUT_ASSIGNMENT: (assignmentId: number) => `${API_BASE_URL}/api/workouts/reject-workout-plan-assignment/${assignmentId}/`,
  },

  // Exercise endpoints
  EXERCISES: {
    GET_ALL: `${API_BASE_URL}/api/exercises/`,
  },

  // Meal endpoints
  MEALS: {
    MEAL_PLANS: `${API_BASE_URL}/api/meals/meal-plans/`,
    MEAL_PLAN_DETAILS: (id: number) => `${API_BASE_URL}/api/meals/meal-plans/${id}/`,
  },
}; 