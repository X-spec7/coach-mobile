import { API_ENDPOINTS } from "../constants/api";
import { getAuthHeaders, getAuthHeadersForDelete } from "./api";
import { authenticatedFetch } from "../utils/auth";

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
  id: string; // Changed from number to string to support UUIDs
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
  connectionStatus?: 'connected' | 'pending' | 'none';
}

// Client interfaces
export interface Client {
  id: string; // Changed from number to string to support UUIDs
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
  connectionStatus?: 'connected' | 'pending' | 'none';
}

// User (generic) interface
export interface User {
  id: string; // Changed from number to string to support UUIDs
  email: string;
  fullName: string;
  userType: string;
  coach_profile?: CoachProfile;
}

// Relationship interfaces
export interface CoachClientRelationship {
  id: string; // Changed from number to string to support UUIDs
  coach: {
    id: string; // Changed from number to string to support UUIDs
    fullName: string;
    email: string;
  };
  client: {
    id: string; // Changed from number to string to support UUIDs
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
  id: string; // Changed from number to string to support UUIDs
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
  coach_id: string; // Changed from number to string to support UUIDs
  client_id: string; // Changed from number to string to support UUIDs
  status: string;
  notes?: string;
}

export interface UpdateRelationshipRequest {
  status: 'active' | 'inactive' | 'terminated';
  notes?: string;
}

export interface AssignWorkoutPlanRequest {
  client_id: string; // Changed from number to string to support UUIDs
  workout_plan_id: number;
  selected_days: string[];
  weeks_count: number;
  suggested_start_date: string;
  due_date: string;
  notes?: string;
}

export interface AcceptWorkoutAssignmentRequest {
  assignment_id: string; // Changed from number to string to support UUIDs
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
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers,
      });
      
      console.log('[getCoaches] Backend response:', response);
      
      // Transform the response to match expected format
      // Map the backend user data to Coach interface
      const transformedCoaches = (response.users || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        userType: user.userType,
        phoneNumber: user.phoneNumber,
        address: user.address,
        gender: user.gender || 'not_specified',
        emailVerified: true, // Assume verified if they can log in
        notificationsEnabled: user.notificationsEnabled || false,
        profilePicture: user.avatarImageUrl,
        coach_profile: {
          certification: user.certifications?.[0]?.certificationTitle || 'Certified Fitness Coach',
          specialization: user.specialization || 'General Fitness',
          yearsOfExperience: user.yearsOfExperience || 1,
          bannerImage: user.bannerImageUrl,
          listed: true // Since they appear in the list
        },
        certifications: (user.certifications || []).map((cert: any) => ({
          certificationTitle: cert.certificationTitle || 'Fitness Certification',
          certificationDetail: cert.certificationDetail || 'Professional fitness certification'
        })),
        reviews: [] // Backend doesn't provide reviews yet, use empty array
      }));
      
      return {
        message: 'Coaches retrieved successfully',
        totalCoachesCount: response.totalUsersCount || transformedCoaches.length,
        coaches: transformedCoaches
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
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers,
      });
      
      // Transform the response to match expected format
      return {
        message: 'Users retrieved successfully',
        totalUsersCount: response.count || response.length || 0,
        users: response.results || response || [] // Handle both paginated and non-paginated responses
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
    const response = await authenticatedFetch(API_ENDPOINTS.USERS.COACH_CLIENT_RELATIONSHIP, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return response;
  },

  // Get coach-client relationships (legacy method - consider using getMyRelationships instead)
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
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers,
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Get my relationships (recommended method - automatically detects user role)
  // ✅ BEST OPTION: Uses GET /api/users/my-relationships/
  // Benefits:
  // ✅ Automatically detects that you're a coach/client (no need to pass user IDs)
  // ✅ Uses the authenticated user context
  // ✅ Returns additional data like active clients/coaches list
  // ✅ Clean and simple to use
  // ✅ More secure as it only returns relationships for the authenticated user
  getMyRelationships: async (params?: {
    status?: string;
  }): Promise<RelationshipsResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to view relationships.');
    }

    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);

    const url = `${API_ENDPOINTS.USERS.MY_RELATIONSHIPS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers,
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Update coach-client relationship
  updateRelationship: async (relationshipId: string, data: UpdateRelationshipRequest): Promise<CreateRelationshipResponse> => {
    const headers = await getAuthHeaders();
    const response = await authenticatedFetch(API_ENDPOINTS.USERS.COACH_CLIENT_RELATIONSHIP_DETAILS(relationshipId), {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return response;
  },

  // Assign workout plan to client (Coach only)
  assignWorkoutPlan: async (data: AssignWorkoutPlanRequest): Promise<AssignWorkoutResponse> => {
    const headers = await getAuthHeaders();
    const response = await authenticatedFetch(API_ENDPOINTS.WORKOUTS.ASSIGN_WORKOUT_PLAN, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return response;
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
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers,
      });
      
      return response;
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
    const response = await authenticatedFetch(API_ENDPOINTS.WORKOUTS.ACCEPT_WORKOUT_ASSIGNMENT, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return response;
  },

  // Reject workout plan assignment (Client only)
  rejectWorkoutAssignment: async (assignmentId: string): Promise<{ message: string }> => {
    const headers = await getAuthHeadersForDelete();
    
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.WORKOUTS.REJECT_WORKOUT_ASSIGNMENT(assignmentId), {
        method: 'POST',
        headers,
      });

      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Get users based on current user's role (role-based discovery)
  findUsersForRole: async (
    currentUserType: string,
    params?: {
      query?: string;
      specialization?: string;
      listed?: string;
      offset?: number;
      limit?: number;
    }
  ): Promise<CoachesResponse | UsersListResponse> => {
    const headers = await getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('Authentication required. Please sign in to discover users.');
    }

    const queryParams = new URLSearchParams();
    
    // Determine target user type based on current user's role
    const targetUserType = currentUserType === 'Coach' ? 'Client' : 'Coach';
    queryParams.append('user_type', targetUserType);
    
    if (params?.query) queryParams.append('query', params.query);
    if (params?.specialization && params.specialization !== 'All') {
      queryParams.append('specialization', params.specialization);
    }
    if (params?.listed) queryParams.append('listed', params.listed);
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const url = `${API_ENDPOINTS.USERS.USERS_LIST}?${queryParams.toString()}`;

    try {
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers,
      });
      
      console.log(`[findUsersForRole] ${currentUserType} searching for ${targetUserType}s:`, response);
      
      if (targetUserType === 'Coach') {
        // Transform for coaches (when clients are searching)
        const transformedCoaches = (response.users || []).map((user: any) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          userType: user.userType,
          phoneNumber: user.phoneNumber,
          address: user.address,
          gender: user.gender || 'not_specified',
          emailVerified: true,
          notificationsEnabled: user.notificationsEnabled || false,
          profilePicture: user.avatarImageUrl,
          coach_profile: {
            certification: user.certifications?.[0]?.certificationTitle || 'Certified Fitness Coach',
            specialization: user.specialization || 'General Fitness',
            yearsOfExperience: user.yearsOfExperience || 1,
            bannerImage: user.bannerImageUrl,
            listed: true
          },
          certifications: (user.certifications || []).map((cert: any) => ({
            certificationTitle: cert.certificationTitle || 'Fitness Certification',
            certificationDetail: cert.certificationDetail || 'Professional fitness certification'
          })),
          reviews: []
        }));
        
        return {
          message: 'Coaches retrieved successfully',
          totalCoachesCount: response.totalUsersCount || transformedCoaches.length,
          coaches: transformedCoaches
        };
      } else {
        // Transform for clients (when coaches are searching)
        const transformedClients = (response.users || []).map((user: any) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          userType: user.userType,
          phoneNumber: user.phoneNumber,
          address: user.address,
          gender: user.gender || 'not_specified',
          emailVerified: true,
          notificationsEnabled: user.notificationsEnabled || false,
          profilePicture: user.avatarImageUrl,
        }));
        
        return {
          message: 'Users retrieved successfully',
          totalUsersCount: response.totalUsersCount || transformedClients.length,
          users: transformedClients
        };
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },
}; 