import { API_ENDPOINTS } from "../constants/api";
import { getAuthHeaders, getAuthHeadersForDelete } from "./api";
import { handle401Error } from "../utils/auth";

// Coach interfaces
export interface CoachProfile {
  certification: string;
  specialization: string;
  yearsOfExperience: number;
  bannerImage: string | null;
  listed: boolean;
}

export interface Certification {
  certificationTitle: string;
  certificationDetail: string;
}

export interface Review {
  reviewerName: string;
  rating: number;
  content: string;
}

export interface Coach {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: string;
  phoneNumber: string | null;
  address: string | null;
  gender: string;
  emailVerified: boolean;
  notificationsEnabled: boolean;
  profilePicture: string | null;
  coach_profile: CoachProfile;
  certifications: Certification[];
  reviews: Review[];
}

// Client interfaces
export interface Client {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: string;
  phoneNumber: string | null;
  address: string | null;
  gender: string;
  emailVerified: boolean;
  notificationsEnabled: boolean;
  profilePicture: string | null;
}

// User (generic) interface
export interface User {
  id: number;
  email: string;
  fullName: string;
  userType: string;
  coach_profile?: CoachProfile;
}

// Relationship interfaces
export interface CoachClientRelationship {
  id: number;
  coach: {
    id: number;
    fullName: string;
    email: string;
  };
  client: {
    id: number;
    fullName: string;
    email: string;
  };
  status: 'pending' | 'active' | 'inactive' | 'terminated';
  startDate: string;
  endDate: string | null;
  notes: string;
}

// Workout assignment interfaces
export interface WorkoutAssignment {
  id: number;
  coach_name: string;
  client_name: string;
  workout_plan_title: string;
  workout_plan: number;
  selected_days: string[];
  weeks_count: number;
  suggested_start_date: string;
  due_date: string;
  notes: string;
  status: 'assigned' | 'applied' | 'completed' | 'overdue' | 'cancelled';
  status_display: string;
  assigned_at: string;
  applied_plan: number | null;
}

// Request interfaces
export interface CreateRelationshipRequest {
  coach_id: number;
  client_id: number;
  status: string;
  notes?: string;
}

export interface UpdateRelationshipRequest {
  status: 'active' | 'inactive' | 'terminated';
  notes?: string;
}

export interface AssignWorkoutPlanRequest {
  client_id: number;
  workout_plan_id: number;
  selected_days: string[];
  weeks_count: number;
  suggested_start_date: string;
  due_date: string;
  notes?: string;
}

export interface AcceptWorkoutAssignmentRequest {
  assignment_id: number;
  start_date?: string;
  selected_days?: string[];
  weeks_count?: number;
}

// Response interfaces
export interface CoachesResponse {
  message: string;
  totalCoachesCount: number;
  coaches: Coach[];
}

export interface UsersListResponse {
  message: string;
  totalUsersCount: number;
  users: User[];
}

export interface RelationshipsResponse {
  message: string;
  relationships: CoachClientRelationship[];
}

export interface WorkoutAssignmentsResponse {
  message: string;
  assignments: WorkoutAssignment[];
}

export interface CreateRelationshipResponse {
  message: string;
  relationship: CoachClientRelationship;
}

export interface AssignWorkoutResponse {
  message: string;
  assignment: WorkoutAssignment;
}

export interface AcceptAssignmentResponse {
  message: string;
  applied_plan: any; // Use existing AppliedWorkoutPlan interface if available
}

// Coach-Client Service
export const CoachClientService = {
  // Get coaches list (for clients)
  getCoaches: async (params?: {
    query?: string;
    specialization?: string;
    listed?: string;
    offset?: number;
    limit?: number;
  }): Promise<CoachesResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view coaches.');
    }

    const queryParams = new URLSearchParams();
    
    // Add user_type filter to get only coaches
    queryParams.append('user_type', 'Coach');
    
    if (params?.query) queryParams.append('query', params.query);
    if (params?.specialization && params.specialization !== 'All') {
      queryParams.append('specialization', params.specialization);
    }
    if (params?.listed) queryParams.append('listed', params.listed);
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const url = `${API_ENDPOINTS.USERS.COACHES}?${queryParams.toString()}`;

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
        throw new Error(`Failed to fetch coaches: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log('[getCoaches] Backend response:', data);
      
      // Transform the response to match expected format
      // The backend might return different structure, so we need to adapt
      return {
        message: 'Coaches retrieved successfully',
        totalCoachesCount: data.count || data.length || 0,
        coaches: data.results || data || [] // Handle both paginated and non-paginated responses
      };
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Get users list (general search)
  getUsersList: async (params: {
    limit: number;
    offset: number;
    user_type?: string;
    query?: string;
    gender?: string;
    specialization?: string;
    listed?: string;
  }): Promise<UsersListResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view users.');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('limit', params.limit.toString());
    queryParams.append('offset', params.offset.toString());
    if (params.user_type) queryParams.append('user_type', params.user_type);
    if (params.query) queryParams.append('query', params.query);
    if (params.gender) queryParams.append('gender', params.gender);
    if (params.specialization) queryParams.append('specialization', params.specialization);
    if (params.listed) queryParams.append('listed', params.listed);

    const url = `${API_ENDPOINTS.USERS.USERS_LIST}?${queryParams.toString()}`;

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
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Transform the response to match expected format
      return {
        message: 'Users retrieved successfully',
        totalUsersCount: data.count || data.length || 0,
        users: data.results || data || [] // Handle both paginated and non-paginated responses
      };
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Create coach-client relationship
  createRelationship: async (data: CreateRelationshipRequest): Promise<CreateRelationshipResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.USERS.COACH_CLIENT_RELATIONSHIP, {
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
      throw new Error(`Failed to create relationship: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Get coach-client relationships
  getRelationships: async (params?: {
    user_id?: number;
    user_type?: string;
    status?: string;
  }): Promise<RelationshipsResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view relationships.');
    }

    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.user_type) queryParams.append('user_type', params.user_type);
    if (params?.status) queryParams.append('status', params.status);

    const url = `${API_ENDPOINTS.USERS.COACH_CLIENT_RELATIONSHIP}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
        throw new Error(`Failed to fetch relationships: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Update coach-client relationship
  updateRelationship: async (relationshipId: number, data: UpdateRelationshipRequest): Promise<CreateRelationshipResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.USERS.COACH_CLIENT_RELATIONSHIP_DETAILS(relationshipId), {
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
      throw new Error(`Failed to update relationship: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Assign workout plan to client (Coach only)
  assignWorkoutPlan: async (data: AssignWorkoutPlanRequest): Promise<AssignWorkoutResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.ASSIGN_WORKOUT_PLAN, {
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
      throw new Error(`Failed to assign workout plan: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Get workout plan assignments
  getWorkoutAssignments: async (params?: {
    role?: string;
    status?: string;
  }): Promise<WorkoutAssignmentsResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view assignments.');
    }

    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    const url = `${API_ENDPOINTS.WORKOUTS.WORKOUT_PLAN_ASSIGNMENTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
        throw new Error(`Failed to fetch assignments: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Accept workout plan assignment (Client only)
  acceptWorkoutAssignment: async (data: AcceptWorkoutAssignmentRequest): Promise<AcceptAssignmentResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.WORKOUTS.ACCEPT_WORKOUT_ASSIGNMENT, {
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
      throw new Error(`Failed to accept assignment: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  // Reject workout plan assignment (Client only)
  rejectWorkoutAssignment: async (assignmentId: number): Promise<{ message: string }> => {
    const headers = await getAuthHeadersForDelete();
    
    try {
      const response = await fetch(API_ENDPOINTS.WORKOUTS.REJECT_WORKOUT_ASSIGNMENT(assignmentId), {
        method: 'POST',
        headers,
      });

      if (response.status === 401) {
        await handle401Error('Your session has expired. Please sign in again.');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reject assignment: ${response.status} - ${errorText}`);
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