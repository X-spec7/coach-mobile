import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export const handle401Error = async (message: string = 'Your session has expired. Please sign in again.') => {
  console.log('[handle401Error] Session expired, clearing tokens and redirecting to login');
  
  try {
    // Clear stored tokens
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  } catch (error) {
    console.warn('[handle401Error] Error clearing tokens:', error);
  }
  
  // Show alert and redirect to login
  Alert.alert(
    'Session Expired',
    message,
    [
      {
        text: 'Sign In',
        onPress: () => {
          router.replace('/sign-in');
        },
      },
    ],
    { cancelable: false }
  );
};

// Enhanced fetch wrapper that automatically handles 401 errors
export const authenticatedFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<any> => {
  try {
    const response = await fetch(url, options);
    
    // Handle 401 errors centrally
    if (response.status === 401) {
      await handle401Error();
      throw new Error('Authentication required');
    }
    
    // Handle other HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }
    
    // Return JSON data
    return await response.json();
  } catch (error) {
    // If it's a 401 error we already handled, just throw
    if (error instanceof Error && error.message === 'Authentication required') {
      throw error;
    }
    
    // For other errors, check if it's a network error that might be a 401
    if (error instanceof TypeError && error.message === 'Network request failed') {
      console.warn('[authenticatedFetch] Network request failed - this might be a 401 error');
    }
    
    throw error;
  }
}; 