import { router } from 'expo-router';

/**
 * Get the API URL for the current environment
 */
export const getApiUrl = () => {
  if (__DEV__) {
    // Use ngrok URL for development
    return 'http://192.168.0.101:3000';
  }
  return 'https://api.armatillo.com';
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
