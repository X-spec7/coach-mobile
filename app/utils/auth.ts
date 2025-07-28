import { router } from 'expo-router';
import { clearToken } from '../services/auth';
import { Alert } from 'react-native';

export const handle401Error = async (message?: string) => {
  // Clear the stored token
  await clearToken();
  
  // Show alert to user
  Alert.alert(
    'Session Expired',
    message || 'Your session has expired. Please sign in again.',
    [
      {
        text: 'OK',
        onPress: () => {
          // Navigate to login page
          router.replace('/(auth)/sign-in');
        }
      }
    ]
  );
}; 