// API service to manage all API calls
import storage, { STORAGE_KEYS } from '../utils/storage';

// Configuration
const API_URL = 'http://192.168.0.101:3000/api'; // Replace with your API URL

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

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  requiresAuth: boolean = true
): Promise<T> {
  try {
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
      // Handle authentication errors
      if (response.status === 401) {
        // Clear token on authentication error
        await storage.removeItem(STORAGE_KEYS.TOKEN);
        throw new Error('Authentication required');
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
    await apiRequest('/auth/logout', 'GET');
    await storage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Verify token is valid
  verifyToken: async () => {
    return apiRequest('/auth/verify', 'GET');
  },
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
