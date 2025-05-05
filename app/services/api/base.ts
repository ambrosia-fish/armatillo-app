import { Platform } from 'react-native';
import { STORAGE_KEYS } from '@/app/services/storage';
import { ensureValidToken } from '@/app/features/auth/utils';
import { getAuthToken } from '@/app/features/auth/utils';
import config from '@/app/config';
import { errorService } from '@/app/services/error';

// Remove the import from strategies.ts
// import { strategiesApi } from './strategies';

export const API_URL = config.apiUrl;
const API_BASE_PATH = config.apiBasePath;

// Maximum retries for failed requests
const MAX_RETRIES = 2;

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Fetch with timeout
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that resolves to fetch response or rejects on timeout
 */
const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  // Create fetch promise with abort signal
  const fetchPromise = fetch(url, {
    ...options,
    signal
  });
  
  // Race between fetch and timeout
  return Promise.race([fetchPromise, timeoutPromise]) as Promise<Response>;
};

/**
 * Makes an API request with retry capability and token refreshing
 * 
 * @param endpoint - API endpoint (without base URL and path)
 * @param options - Fetch options
 * @param retryCount - Current retry count (for internal use)
 * @returns Promise that resolves to API response
 */
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}, 
  retryCount: number = 0
): Promise<any> => {
  try {
    // Ensure we have a valid token before making the request
    if (endpoint !== '/auth/login' && endpoint !== '/auth/register') {
      const tokenValid = await ensureValidToken();
      if (!tokenValid && !endpoint.startsWith('/auth/refresh')) {
        throw new Error('No valid auth token available');
      }
    }
    
    // Get the latest token
    const token = await getAuthToken();
    
    // Prepare headers with content type and auth token
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    } as Record<string, string>;
    
    // Add authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Build full URL
    const url = `${API_URL}${API_BASE_PATH}${endpoint}`;
    
    console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);
    
    // Make the request with timeout
    const response = await fetchWithTimeout(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized - token might be invalid or expired
    if (response.status === 401 && retryCount < MAX_RETRIES) {
      errorService.handleError('Authentication failed (401)', {
        level: 'warning',
        source: 'auth',
        displayToUser: false,
        context: { endpoint, retryCount }
      });
      
      // Try to refresh token and retry the request
      if (await ensureValidToken()) {
        console.log(`Retrying request after token refresh: ${endpoint}`);
        return apiRequest(endpoint, options, retryCount + 1);
      } else {
        throw new Error('Authentication failed and token refresh was unsuccessful');
      }
    }
    
    // Parse response based on content type
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const responseText = await response.text();
      
      // Try to parse JSON response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        errorService.handleError(parseError instanceof Error ? parseError : String(parseError), {
          source: 'api',
          level: 'error',
          context: {
            endpoint,
            responseText: responseText.substring(0, 100),
            status: response.status
          }
        });
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
      
      // Handle non-success response with JSON data
      if (!response.ok) {
        const errorMessage = data.message || data.error || 'API error occurred';
        errorService.handleError(errorMessage, {
          source: 'api',
          level: 'error',
          context: {
            endpoint,
            statusCode: response.status,
            data: JSON.stringify(data).substring(0, 200)
          }
        });
        throw new Error(errorMessage);
      }
      
      return data;
    } else {
      // Handle non-JSON response
      const responseText = await response.text();
      
      // Handle non-success response without JSON data
      if (!response.ok) {
        errorService.handleError(`Network response was not ok: ${response.status} ${response.statusText}`, {
          source: 'network',
          level: 'error',
          context: {
            endpoint,
            statusCode: response.status,
            statusText: response.statusText,
            responseText: responseText.substring(0, 100)
          }
        });
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      
      return responseText;
    }
  } catch (error) {
    // Special handling for aborted requests (timeouts)
    if (error instanceof Error && error.name === 'AbortError') {
      errorService.handleError('Request timed out', {
        source: 'network',
        level: 'warning',
        context: { endpoint, method: options.method }
      });
      throw new Error(`Request timed out: ${endpoint}`);
    }
    
    // Handle retry for network errors
    if (error instanceof Error && 
        (error.message.includes('Network request failed') || error.message.includes('network error')) && 
        retryCount < MAX_RETRIES) {
      console.log(`Retrying due to network error: ${endpoint}`);
      return apiRequest(endpoint, options, retryCount + 1);
    }
    
    // Log error and rethrow
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'api',
      level: 'error',
      context: { endpoint, method: options.method, retryCount }
    });
    throw error;
  }
};

/**
 * API functions for instances
 */
export const instancesApi = {
  /**
   * Get all instances
   */
  getInstances: async () => {
    return apiRequest('/instances', { method: 'GET' });
  },
  
  /**
   * Get instance by ID
   */
  getInstance: async (id: string) => {
    return apiRequest(`/instances/${id}`, { method: 'GET' });
  },
  
  /**
   * Create a new instance
   */
  createInstance: async (data: any) => {
    return apiRequest('/instances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Update an instance
   */
  updateInstance: async (id: string, data: any) => {
    return apiRequest(`/instances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Delete an instance
   */
  deleteInstance: async (id: string) => {
    return apiRequest(`/instances/${id}`, { method: 'DELETE' });
  },
};

/**
 * API functions for authentication
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  /**
   * Register a new user
   */
  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  /**
   * Get current user info
   */
  getUserInfo: async () => {
    return apiRequest('/auth/me', { method: 'GET' });
  },
  
  /**
   * Refresh authentication token
   */
  refreshToken: async (refreshToken: string = '') => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
  
  /**
   * Logout user
   */
  logout: async () => {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};

// Create empty placeholder for strategiesApi that will be filled later
export const strategiesApi = {};

// Export base API object without including strategiesApi yet
const api = {
  instances: instancesApi,
  auth: authApi,
};

export default api;