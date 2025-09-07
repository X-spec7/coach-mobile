import { getAuthHeaders } from './api';

const API_BASE_URL = 'http://52.15.195.49:8000';

// Types for Goals
export interface Goal {
  id: string;
  title: string;
  icon: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGoal {
  id: number;
  goal: Goal;
  is_active: boolean;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date: string;
  target_date?: string;
  completed_at?: string;
  progress_percentage: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  id: number;
  value: number;
  unit: string;
  notes?: string;
  created_at: string;
}

export interface AddGoalRequest {
  goal_id: string;
  target_value?: number;
  unit?: string;
  target_date?: string;
}

export interface UpdateGoalRequest {
  is_active?: boolean;
  target_value?: number;
  current_value?: number;
  unit?: string;
  target_date?: string;
}

export interface ProgressUpdateRequest {
  value: number;
  unit: string;
  notes?: string;
}

export interface UserGoalsResponse {
  message: string;
  goals: Array<Goal & { user_goal?: UserGoal }>;
}

export interface AvailableGoalsResponse {
  message: string;
  available_goals: Goal[];
}

export interface AddGoalResponse {
  message: string;
  user_goal: UserGoal;
}

export interface UpdateGoalResponse {
  message: string;
  user_goal: UserGoal;
}

export interface RemoveGoalResponse {
  message: string;
}

export interface ProgressUpdateResponse {
  message: string;
  progress: GoalProgress;
  user_goal: UserGoal;
}

export interface ProgressHistoryResponse {
  message: string;
  progress_history: GoalProgress[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ToggleGoalResponse {
  message: string;
  user_goal: UserGoal;
}

export interface SetPrimaryGoalResponse {
  message: string;
  primary_goal: Goal;
}

export interface GoalStatisticsResponse {
  message: string;
  statistics: {
    total_goals: number;
    active_goals: number;
    completed_goals: number;
    completion_rate: number;
    average_progress: number;
    goals_by_category: Record<string, number>;
  };
}

// Get user's goals
export const getUserGoals = async (): Promise<UserGoalsResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/goals/user-goals/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user goals');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user goals:', error);
    throw error;
  }
};

// Get available goals
export const getAvailableGoals = async (): Promise<AvailableGoalsResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/goals/available/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch available goals');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching available goals:', error);
    throw error;
  }
};

// Add goal to user
export const addGoal = async (data: AddGoalRequest): Promise<AddGoalResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/goals/add/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add goal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

// Update goal
export const updateGoal = async (goalId: number, data: UpdateGoalRequest): Promise<UpdateGoalResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update goal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

// Toggle goal status
export const toggleGoal = async (goalId: number, isActive: boolean): Promise<ToggleGoalResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/toggle/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ is_active: isActive }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to toggle goal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling goal:', error);
    throw error;
  }
};

// Remove goal
export const removeGoal = async (goalId: number): Promise<RemoveGoalResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove goal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing goal:', error);
    throw error;
  }
};

// Update progress
export const updateProgress = async (goalId: number, data: ProgressUpdateRequest): Promise<ProgressUpdateResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/progress/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

// Get progress history
export const getProgressHistory = async (goalId: number, limit = 50, offset = 0): Promise<ProgressHistoryResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/progress/history/?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch progress history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching progress history:', error);
    throw error;
  }
};

// Set primary goal
export const setPrimaryGoal = async (userGoalId: number): Promise<SetPrimaryGoalResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/goals/set-primary/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ user_goal_id: userGoalId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to set primary goal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting primary goal:', error);
    throw error;
  }
};

// Get statistics
export const getStatistics = async (): Promise<GoalStatisticsResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/goals/statistics/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};