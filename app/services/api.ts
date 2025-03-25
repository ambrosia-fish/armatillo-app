import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage';
import { ensureValidToken } from '../utils/tokenRefresher';
import config from '../constants/config';

// Base API URL from centralized config
export const API_URL = config.apiUrl;
const API_BASE_PATH = config.apiBasePath;

// Helper function to get authentication token
const getAuthToken = async (): Promise<string | null> => {
  try {
    console.log('Getting auth token from storage');
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    console.log('Token from AsyncStorage:', token ? 'found' : 'not found');
    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

// Generic API request handler with authentication and token refresh
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Try to ensure we have a valid token before making the request
    // This will automatically refresh the token if needed
    const isValidToken = await ensureValidToken();
    
    // Get the (potentially refreshed) token
    const token = await getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add authentication token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // If we still don't have a token after refresh attempt, log warning
      if (!isValidToken) {
        console.warn(`Making request to ${endpoint} without valid authentication token`);
      }
    }
    
    const url = `${API_URL}${API_BASE_PATH}${endpoint}`;
    
    if (config.enableLogging) {
      console.log(`Making API request to: ${url}`);
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (config.enableLogging) {
      console.log(`Response status for ${endpoint}:`, response.status);
    }
    
    // Handle 401 Unauthorized errors (potential token issue)
    if (response.status === 401) {
      // We already tried to refresh the token before making the request,
      // so this 401 means our refresh token is likely invalid too
      console.error('Authentication failed (401) even after token refresh attempt');
      // Could trigger a logout event here
    }
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const responseText = await response.text(); // Get raw text first
      
      if (config.enableLogging) {
        console.log(`Response for ${endpoint}:`, responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Error parsing JSON from ${endpoint}:`, parseError);
        console.error('Response was:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
      
      // Check for successful response
      if (!response.ok) {
        const errorMessage = data.message || data.error || 'API error occurred';
        console.error(`API error for ${endpoint}:`, errorMessage);
        throw new Error(errorMessage);
      }
      
      return data;
    } else {
      // Handle non-JSON responses
      const responseText = await response.text();
      
      if (config.enableLogging) {
        console.log(`Non-JSON response for ${endpoint}:`, responseText.substring(0, 200));
      }
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      
      return responseText;
    }
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
};

// Add a debug method to test token storage
export const debugTokenStorage = async (): Promise<void> => {
  try {
    console.log('=== DEBUG TOKEN STORAGE ===');
    console.log('Current API URL:', API_URL);
    
    // Try to get token using AsyncStorage directly
    try {
      const asyncToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('AsyncStorage token:', asyncToken ? 'exists' : 'not found');
    } catch (error) {
      console.log('Error reading from AsyncStorage:', error);
    }
    
    // Check all AsyncStorage keys to find token
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage keys:', allKeys);
      
      for (const key of allKeys) {
        if (key.includes('token') || key.includes('TOKEN')) {
          const value = await AsyncStorage.getItem(key);
          console.log(`Found key "${key}" with value:`, value ? 'exists' : 'empty');
        }
      }
    } catch (error) {
      console.log('Error listing AsyncStorage keys:', error);
    }
    
    console.log('===========================');
  } catch (error) {
    console.error('Debug token storage error:', error);
  }
};

// Instances API
export const instancesApi = {
  // Get all instances for the current user
  getInstances: async () => {
    try {
      return await apiRequest('/instances', { method: 'GET' });
    } catch (error) {
      console.error('getInstances error:', error);
      throw error;
    }
  },
  
  // Get a specific instance by ID
  getInstance: async (id: string) => {
    try {
      return await apiRequest(`/instances/${id}`, { method: 'GET' });
    } catch (error) {
      console.error(`getInstance error for ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new instance
  createInstance: async (data: any) => {
    try {
      if (config.enableLogging) {
        console.log('Creating instance with data:', JSON.stringify(data, null, 2));
      }
      
      return await apiRequest('/instances', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('createInstance error:', error);
      throw error;
    }
  },
  
  // Update an existing instance
  updateInstance: async (id: string, data: any) => {
    try {
      return await apiRequest(`/instances/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`updateInstance error for ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete an instance
  deleteInstance: async (id: string) => {
    try {
      return await apiRequest(`/instances/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`deleteInstance error for ID ${id}:`, error);
      throw error;
    }
  },
};

// Authentication API
export const authApi = {
  // User login
  login: async (email: string, password: string) => {
    try {
      return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      console.error('login error:', error);
      throw error;
    }
  },
  
  // User registration
  register: async (userData: any) => {
    try {
      return await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('register error:', error);
      throw error;
    }
  },
  
  // Get current user info
  getUserInfo: async () => {
    try {
      return await apiRequest('/auth/me', { method: 'GET' });
    } catch (error) {
      console.error('getUserInfo error:', error);
      throw error;
    }
  },
  
  // Refresh authentication token
  refreshToken: async (refreshToken: string) => {
    try {
      return await apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('refreshToken error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      return await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('logout error:', error);
      throw error;
    }
  },
};

// Main API object with namespaced endpoints
const api = {
  instances: instancesApi,
  auth: authApi,
  debug: {
    debugTokenStorage
  }
};

// Log that API is initialized
console.log('API service initialized with URL:', API_URL);

export default api;