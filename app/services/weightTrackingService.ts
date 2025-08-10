import { API_ENDPOINTS } from '@/constants/api';
import { getAuthHeaders } from './api';
import { authenticatedFetch } from '../utils/auth';

// Weight tracking interfaces based on API documentation
export interface WeightEntry {
  id: string;
  date: string;
  weight_value: string;
  unit: 'kg' | 'lbs';
  unit_display: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightStatistics {
  total_entries: number;
  average_weight: number;
  min_weight: number;
  max_weight: number;
  weight_change: number;
  unit: string;
  date_range: string;
}

export interface CreateWeightEntryRequest {
  date: string;
  weight_value: number;
  unit: 'kg' | 'lbs';
  notes?: string;
}

export interface UpdateWeightEntryRequest {
  weight_value: number;
  unit: 'kg' | 'lbs';
  notes?: string;
}

export interface WeightHistoryResponse {
  message: string;
  weight_entries: WeightEntry[];
  statistics: WeightStatistics;
  total_count: number;
}

export interface WeightEntryResponse {
  message: string;
  weight_entry: WeightEntry;
}

export interface CreateWeightEntryResponse {
  message: string;
  weight_entry: WeightEntry;
}

export interface UpdateWeightEntryResponse {
  message: string;
  weight_entry: WeightEntry;
}

export interface DeleteWeightEntryResponse {
  message: string;
}

export interface LatestWeightEntryResponse {
  message: string;
  weight_entry: WeightEntry;
}

// Search parameters interfaces
export interface WeightHistoryParams {
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export const WeightTrackingService = {
  // Create a new weight entry
  createWeightEntry: async (entryData: CreateWeightEntryRequest): Promise<CreateWeightEntryResponse> => {
    const url = `${API_ENDPOINTS.WEIGHT_TRACKING.CREATE}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(entryData),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Update an existing weight entry
  updateWeightEntry: async (entryId: string, entryData: UpdateWeightEntryRequest): Promise<UpdateWeightEntryResponse> => {
    const url = `${API_ENDPOINTS.WEIGHT_TRACKING.UPDATE(entryId)}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(entryData),
      });
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Delete a weight entry
  deleteWeightEntry: async (entryId: string): Promise<DeleteWeightEntryResponse> => {
    const url = `${API_ENDPOINTS.WEIGHT_TRACKING.DELETE(entryId)}`;
    
    try {
      const response = await authenticatedFetch(url, {
        method: 'DELETE',
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

  // Get a specific weight entry
  getWeightEntry: async (entryId: string): Promise<WeightEntryResponse> => {
    const url = `${API_ENDPOINTS.WEIGHT_TRACKING.GET_ENTRY(entryId)}`;
    
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

  // Get weight history with statistics
  getWeightHistory: async (params: WeightHistoryParams = {}): Promise<WeightHistoryResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.date_from) {
      queryParams.append('date_from', params.date_from);
    }
    if (params.date_to) {
      queryParams.append('date_to', params.date_to);
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_ENDPOINTS.WEIGHT_TRACKING.HISTORY}${queryString}`;
    
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

  // Get the latest weight entry
  getLatestWeightEntry: async (): Promise<LatestWeightEntryResponse> => {
    const url = `${API_ENDPOINTS.WEIGHT_TRACKING.LATEST}`;
    
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