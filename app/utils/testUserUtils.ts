import { router } from 'expo-router';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Get the API URL for the current environment
 */
export const getApiUrl = () => {
  if (__DEV__) {
    // Read from environment variables or use fallbacks
    if (Platform.OS === 'web') {
      return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    }
    
    // For iOS simulator, use localhost with special mapping
    if (Platform.OS === 'ios' && !Constants.expoConfig?.debuggerHost?.includes('127.0.0.1')) {
      return 'http://localhost:3000';
    }
    
    // For Android emulator, get host IP from Expo
    if (Platform.OS === 'android' && Constants.expoConfig?.debuggerHost) {
      const host = Constants.expoConfig.debuggerHost.split(':')[0];
      return `http://${host}:3000`;
    }
    
    // Fallback for development
    return 'http://localhost:3000';
  }
  
  // Production API URL
  return process.env.EXPO_PUBLIC_API_URL || 'https://api.armatillo.com';
};

// API URL
export const API_URL = getApiUrl();

/**
 * Handle pending test user response
 * @param url The redirect URL from OAuth
 */
export const handlePendingResponse = async (url: string) => {
  try {
    console.log('Handling pending test user URL:', url);
    
    // Extract message from URL
    const urlWithoutHash = url.split('#')[0];
    const urlParams = new URLSearchParams(urlWithoutHash.split('?')[1]);
    const message = urlParams.get('message');
    
    // Route to pending screen with message
    router.replace({
      pathname: '/auth/pending',
      params: { message: message || 'Your access request is pending approval.' }
    });
    
    return true;
  } catch (error) {
    console.error('Error handling pending response:', error);
    
    // Navigate to login screen
    router.replace('/login');
    return false;
  }
};

/**
 * Check if a user is an approved test user
 * @param email The email to check
 */
export const checkTestUserStatus = async (email: string): Promise<{ approved: boolean, message?: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/check-test-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      console.error('Failed to check test user status:', await response.text());
      return { approved: false };
    }
    
    const data = await response.json();
    return {
      approved: data.approved,
      message: data.message
    };
  } catch (error) {
    console.error('Error checking test user status:', error);
    return { approved: false };
  }
};
