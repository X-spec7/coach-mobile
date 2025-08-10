import { API_ENDPOINTS } from '@/constants/api';
import { getAuthHeaders } from './api';
import { authenticatedFetch } from '../utils/auth';

// User interfaces based on API documentation
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  user_type: 'Coach' | 'Client';
  phone_number?: string;
  address?: string;
  gender?: 'male' | 'female' | 'not_specified';
  email_verified: boolean;
  notifications_enabled: boolean;
  avatarUrl?: string | null;
  coach_profile?: {
    certification?: string;
    specialization?: string;
    years_of_experience?: number;
    banner_image?: string;
    listed: boolean;
  };
  client_profile?: {
    interests?: string[];
    help_categories?: string[];
  };
  height?: {
    value: number;
    unit: string;
    feet?: number;
    inches?: number;
  };
  weight?: {
    value: number;
    unit: string;
  };
  created_at: string;
  updated_at: string;
}

// Response interfaces
export interface UsersListResponse {
  message: string;
  totalUsersCount: number;
  users: User[];
}

export interface CoachesListResponse {
  message: string;
  totalCount: number;
  coaches: User[];
}

export interface ClientsListResponse {
  message: string;
  totalCount: number;
  clients: User[];
}

export interface UserResponse {
  message: string;
  user: User;
}

// Search parameters interfaces
export interface UsersSearchParams {
  limit: number;
  offset: number;
  user_type?: 'Coach' | 'Client' | 'all';
  query?: string;
  gender?: 'male' | 'female' | 'not_specified' | 'all';
  specialization?: string;
  listed?: 'listed' | 'unlisted' | 'all';
}

export interface CoachesSearchParams {
  query?: string;
  limit?: number;
  offset?: number;
  specialization?: string;
  listed?: 'listed' | 'unlisted' | 'all';
  gender?: 'male' | 'female' | 'not_specified' | 'all';
}

export interface ClientsSearchParams {
  query?: string;
  limit?: number;
  offset?: number;
  gender?: 'male' | 'female' | 'not_specified' | 'all';
}

export const UserService = {
  // Get all users (mixed) with search and filters
  getUsers: async (params: UsersSearchParams): Promise<UsersListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', params.limit.toString());
    queryParams.append('offset', params.offset.toString());
    
    if (params.user_type && params.user_type !== 'all') {
      queryParams.append('user_type', params.user_type);
    }
    if (params.query) {
      queryParams.append('query', params.query);
    }
    if (params.gender && params.gender !== 'all') {
      queryParams.append('gender', params.gender);
    }
    if (params.specialization) {
      queryParams.append('specialization', params.specialization);
    }
    if (params.listed && params.listed !== 'all') {
      queryParams.append('listed', params.listed);
    }

    const url = `${API_ENDPOINTS.USERS.USERS_LIST}?${queryParams.toString()}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Get coaches list with search and filters
  getCoaches: async (params: CoachesSearchParams = {}): Promise<CoachesListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.query) {
      queryParams.append('query', params.query);
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.offset) {
      queryParams.append('offset', params.offset.toString());
    }
    if (params.specialization) {
      queryParams.append('specialization', params.specialization);
    }
    if (params.listed && params.listed !== 'all') {
      queryParams.append('listed', params.listed);
    }
    if (params.gender && params.gender !== 'all') {
      queryParams.append('gender', params.gender);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_ENDPOINTS.USERS.COACHES}${queryString}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Get clients list with search and filters
  getClients: async (params: ClientsSearchParams = {}): Promise<ClientsListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.query) {
      queryParams.append('query', params.query);
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.offset) {
      queryParams.append('offset', params.offset.toString());
    }
    if (params.gender && params.gender !== 'all') {
      queryParams.append('gender', params.gender);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_ENDPOINTS.USERS.CLIENTS_LIST}${queryString}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<UserResponse> => {
    const url = `${API_ENDPOINTS.USERS.USERS_LIST}${userId}/`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },
}; 