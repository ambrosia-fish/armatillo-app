// API service to manage all API calls
import storage, { STORAGE_KEYS } from '../utils/storage';
import { 
  isTokenExpired, 
  storeAuthTokens, 
  getRefreshToken,
  clearAuthTokens 
} from '../utils/tokenUtils';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Configuration for different environments
const getApiUrl = () => {
  // Force using Railway in development mode for testing
  const useRailway = true;
  
  if (__DEV__ && !useRailway) {
    // Use local development server
    return 'http://localhost:3000/api';
  }
  return 'https://armatillo-api-production.up.railway.app/api';
};

// API URL
const API_URL = getApiUrl();

// Base headers for all requests
const baseHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Helper to get authentication token
async function getAuthToken(): Promise<string | null> {
  return await storage.getItem(STORAGE_KEYS.TOKEN);
}

// Helper to create authenticated headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  return token
    ? {
        ...baseHeaders,
        Authorization: `Bearer ${token}`,
      }
    : baseHeaders;
}

// Token refresh in progress flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue of requests to retry after token refresh
let refreshQueue: Array<() => void> = [];

// Process all queued requests with fresh token
const processQueue = () => {
  refreshQueue.forEach(callback => callback());
  refreshQueue = [];
};

// Refresh the authentication token
async function refreshAuthToken(): Promise<boolean> {
  // If already refreshing, wait for it to complete
  if (isRefreshing) {
    return new Promise(resolve => {
      refreshQueue.push(() => resolve(true));
    });
  }

  try {
    isRefreshing = true;
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      // No refresh token available, must re-login
      console.log('No refresh token available, user must re-login');
      await handleAuthFailure();
      return false;
    }

    // Call token refresh endpoint
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text());
      await handleAuthFailure();
      return false;
    }

    // Parse response with new tokens
    const data = await response.json();
    if (data.token) {
      // Store new tokens
      await storeAuthTokens(
        data.token, 
        data.expiresIn || undefined, 
        data.refreshToken || undefined
      );
      console.log('Token refreshed successfully');
      
      // Process any queued requests
      processQueue();
      return true;
    } else {
      console.error('Invalid response from refresh endpoint');
      await handleAuthFailure();
      return false;
    }
  } catch (error) {
    console.error('Error refreshing auth token:', error);
    await handleAuthFailure();
    return false;
  } finally {
    isRefreshing = false;
  }
}

// Handle authentication failure
async function handleAuthFailure() {
  // Clear all auth tokens
  await clearAuthTokens();
  
  // Clear user data
  await storage.removeItem(STORAGE_KEYS.USER);
  await storage.removeItem(STORAGE_KEYS.USER_NAME);
  
  // Alert user and redirect to login
  Alert.alert(
    'Session Expired',
    'Your session has expired. Please sign in again.',
    [{ text: 'OK', onPress: () => router.replace('/login') }]
  );
}

// Generic API request function with token refresh
async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  requiresAuth: boolean = true
): Promise<T> {
  try {
    // Check token expiration if authentication is required
    if (requiresAuth && await isTokenExpired()) {
      console.log('Token expired, attempting refresh');
      const refreshed = await refreshAuthToken();
      if (!refreshed) {
        throw new Error('Authentication required');
      }
    }

    // Prepare request options
    const headers = requiresAuth ? await getAuthHeaders() : baseHeaders;
    const options: RequestInit = {
      method,
      headers,
    };

    // Add body if data is provided and method is not GET
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    // Make request
    const response = await fetch(`${API_URL}${endpoint}`, options);

    // Handle response
    if (!response.ok) {
      // Handle unauthorized errors (expired token)
      if (response.status === 401) {
        console.log('Received 401 from API, attempting token refresh');
        const refreshed = await refreshAuthToken();
        
        if (refreshed) {
          // Retry the request with new token
          console.log('Retrying request with new token');
          return apiRequest<T>(endpoint, method, data, requiresAuth);
        } else {
          // Token refresh failed
          throw new Error('Authentication required');
        }
      }

      const errorText = await response.text();
      throw new Error(errorText || `API error: ${response.status}`);
    }

    // Parse JSON response
    const result = await response.json();
    return result as T;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// AUTH API functions
export const authApi = {
  // Get current user profile
  getCurrentUser: async () => {
    return apiRequest('/auth/me', 'GET');
  },

  // Logout
  logout: async () => {
    try {
      await apiRequest('/auth/logout', 'POST');
    } catch (error) {
      console.warn('Error calling logout endpoint:', error);
      // Continue with local logout even if API call fails
    }
    
    // Clear all auth-related data
    await clearAuthTokens();
    await storage.removeItem(STORAGE_KEYS.USER);
    await storage.removeItem(STORAGE_KEYS.USER_NAME);
  },

  // Verify token is valid
  verifyToken: async () => {
    return apiRequest('/auth/verify', 'GET');
  },
  
  // Refresh token explicitly
  refreshToken: async () => {
    return refreshAuthToken();
  }
};

// INSTANCES API functions
export const instancesApi = {
  // Get all instances
  getInstances: async () => {
    return apiRequest('/instances', 'GET');
  },

  // Get single instance
  getInstance: async (id: string) => {
    return apiRequest(`/instances/${id}`, 'GET');
  },

  // Create new instance
  createInstance: async (data: any) => {
    return apiRequest('/instances', 'POST', data);
  },

  // Update instance
  updateInstance: async (id: string, data: any) => {
    return apiRequest(`/instances/${id}`, 'PUT', data);
  },

  // Delete instance
  deleteInstance: async (id: string) => {
    return apiRequest(`/instances/${id}`, 'DELETE');
  },
};

export default {
  auth: authApi,
  instances: instancesApi,
};
