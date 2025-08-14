import { API_ENDPOINTS } from '@/constants/api';
import { getAuthHeaders } from './api';
import { authenticatedFetch } from '../utils/auth';

// Session interfaces based on API documentation
export interface Session {
  id: string;
  title: string;
  startDate: string;
  duration: number;
  coachId: string;
  coachFullname: string;
  goal: string;
  level: string;
  description: string;
  totalParticipantNumber: number;
  currentParticipantNumber: number;
  bannerImageUrl?: string;
  price: number;
  equipments: string[];
  meetingId: string;
  isBooked: boolean;
}

export interface CreateSessionRequest {
  title: string;
  startDate: string;
  duration: number;
  goal: string;
  level: string;
  description: string;
  totalParticipantNumber: number;
  price: number;
  equipments?: string[];
  bannerImage?: string; // Optional base64 encoded banner image
}

export interface BookSessionRequest {
  sessionId: string;
}

export interface JoinSessionRequest {
  sessionId: string;
}



export interface JoinSessionResponse {
  zoom_url: string;
}

export interface CreateSessionResponse {
  message: string;
  sessionId: string;
  meetingId: string;
}

export interface SessionsResponse {
  message: string;
  sessions: Session[];
  totalSessionCount: number;
}

export interface SessionCountResponse {
  message: string;
  totalSessionCount: number;
}

export interface BookSessionResponse {
  message: string;
}

// Search parameters interfaces
export interface SessionsSearchParams {
  limit: number;
  offset: number;
  goal?: string;
  booked?: boolean;
  query?: string;
}

export interface MySessionsSearchParams {
  limit: number;
  offset: number;
  query?: string;
}

export const SessionService = {
  // Coach: Create a new session
  createSession: async (sessionData: CreateSessionRequest): Promise<CreateSessionResponse> => {
    const url = `${API_ENDPOINTS.SESSIONS.CREATE}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(sessionData),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Coach: Get my sessions
  getMySessions: async (params: MySessionsSearchParams): Promise<SessionsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', params.limit.toString());
    queryParams.append('offset', params.offset.toString());
    
    if (params.query) {
      queryParams.append('query', params.query);
    }

    const url = `${API_ENDPOINTS.SESSIONS.GET_MINE}?${queryParams.toString()}`;
    
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

  // Coach: Get my sessions count
  getMySessionsCount: async (query?: string): Promise<SessionCountResponse> => {
    const queryParams = new URLSearchParams();
    if (query) {
      queryParams.append('query', query);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_ENDPOINTS.SESSIONS.GET_MINE_COUNT}${queryString}`;
    
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



  // Client: Get all sessions
  getAllSessions: async (params: SessionsSearchParams): Promise<SessionsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', params.limit.toString());
    queryParams.append('offset', params.offset.toString());
    
    if (params.goal) {
      queryParams.append('goal', params.goal);
    }
    if (params.booked !== undefined) {
      queryParams.append('booked', params.booked.toString());
    }
    if (params.query) {
      queryParams.append('query', params.query);
    }

    const url = `${API_ENDPOINTS.SESSIONS.GET_ALL}?${queryParams.toString()}`;
    
    // Debug logging
    console.log(`[SessionService] getAllSessions URL: ${url}`);
    console.log(`[SessionService] booked parameter: ${params.booked}`);
    
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

  // Client: Get sessions count
  getSessionsCount: async (params: {
    goal?: string;
    booked?: boolean;
    query?: string;
  } = {}): Promise<SessionCountResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.goal) {
      queryParams.append('goal', params.goal);
    }
    if (params.booked !== undefined) {
      queryParams.append('booked', params.booked.toString());
    }
    if (params.query) {
      queryParams.append('query', params.query);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_ENDPOINTS.SESSIONS.GET_COUNT}${queryString}`;
    
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

  // Client: Book a session
  bookSession: async (sessionId: string): Promise<BookSessionResponse> => {
    const url = `${API_ENDPOINTS.SESSIONS.BOOK}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ sessionId }),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Both: Join a session (get Zoom URL)
  joinSession: async (sessionId: string): Promise<JoinSessionResponse> => {
    const url = `${API_ENDPOINTS.SESSIONS.JOIN}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ sessionId }),
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