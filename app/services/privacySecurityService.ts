import { getAuthHeaders } from './api';

const API_BASE_URL = 'http://52.15.195.49:8000';

// Types for Privacy & Security
export interface PrivacySettings {
  profile_visibility: boolean;
  data_collection: boolean;
  analytics: boolean;
  marketing_communications: boolean;
}

export interface SecurityInfo {
  id: string;
  email: string;
  password_changed_at: string | null;
  deletion_requested_at: string | null;
  is_deleted: boolean;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AccountDeletionRequest {
  password: string;
  reason?: string;
}

// Get privacy settings
export const getPrivacySettings = async (): Promise<{
  message: string;
  privacy_settings: PrivacySettings;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/privacy-settings/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch privacy settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    throw error;
  }
};

// Update privacy settings
export const updatePrivacySettings = async (settings: PrivacySettings): Promise<{
  message: string;
  privacy_settings: PrivacySettings;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/privacy-settings/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update privacy settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData: ChangePasswordRequest): Promise<{
  message: string;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/change-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }

    return await response.json();
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Request account deletion
export const requestAccountDeletion = async (deletionData: AccountDeletionRequest): Promise<{
  message: string;
  deletion_scheduled_at: string;
  confirmation_required: boolean;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/request-deletion/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(deletionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to request account deletion');
    }

    return await response.json();
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    throw error;
  }
};

// Cancel account deletion
export const cancelAccountDeletion = async (password: string): Promise<{
  message: string;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/cancel-deletion/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel account deletion');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling account deletion:', error);
    throw error;
  }
};

// Get security information
export const getSecurityInfo = async (): Promise<{
  message: string;
  security_info: SecurityInfo;
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/security-info/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch security information');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching security information:', error);
    throw error;
  }
};