import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage';

// Configuration for different environments
const getApiUrl = () => {
  // When running in development mode (local)
  if (__DEV__) {
    // Use the development deployment on Railway
    return 'https://armatillo-api-development.up.railway.app/api';
    
    // Uncomment this if you want to use a local server instead
    // return 'http://localhost:3000/api';
  }
  
  // When running in production (deployed app)
  return 'https://armatillo-api-production.up.railway.app/api';
};

// Base API URL
const API_URL = getApiUrl();

// Helper function to get authentication token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

// Generic API request handler with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add authentication token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // Check for successful response
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }
      
      return data;
    } else {
      // Handle non-JSON responses
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return await response.text();
    }
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
};

// Instances API
export const instancesApi = {
  // Get all instances for the current user
  getInstances: async () => {
    return apiRequest('/instances', { method: 'GET' });
  },
  
  // Get a specific instance by ID
  getInstance: async (id: string) => {
    return apiRequest(`/instances/${id}`, { method: 'GET' });
  },
  
  // Create a new instance
  createInstance: async (data: any) => {
    return apiRequest('/instances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update an existing instance
  updateInstance: async (id: string, data: any) => {
    return apiRequest(`/instances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete an instance
  deleteInstance: async (id: string) => {
    return apiRequest(`/instances/${id}`, { method: 'DELETE' });
  },
};

// Authentication API
export const authApi = {
  // User login
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  // User registration
  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  // Get current user info
  getUserInfo: async () => {
    return apiRequest('/auth/me', { method: 'GET' });
  },
  
  // Refresh authentication token
  refreshToken: async (refreshToken: string) => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
  
  // Logout user
  logout: async () => {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};

// Main API object with namespaced endpoints
const api = {
  instances: instancesApi,
  auth: authApi,
};

export default api;
