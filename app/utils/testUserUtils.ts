import { router } from 'expo-router';
import { API_URL } from '../services/api';

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
    // Call the API endpoint
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

// Add a default export to prevent router from treating this as a component
const testUserUtils = {
  handlePendingResponse,
  checkTestUserStatus
};

export default testUserUtils;
