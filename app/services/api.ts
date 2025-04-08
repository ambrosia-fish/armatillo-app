import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage';
import { ensureValidToken } from '../utils/tokenRefresher';
import config from '../constants/config';
import { errorService } from './ErrorService';

export const API_URL = config.apiUrl;
const API_BASE_PATH = config.apiBasePath;

const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    return token;
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      displayToUser: false,
      context: { action: 'getAuthToken' }
    });
    return null;
  }
};

// Check if an error contains approval-related text
const isApprovalRelatedError = (message: string): boolean => {
  const approvalPhrases = [
    'pre-alpha',
    'testing is only available',
    'Thank You for your interest',
    'pending approval',
    'contact josef@feztech.io'
  ];
  
  return approvalPhrases.some(phrase => message.includes(phrase));
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    await ensureValidToken();
    
    const token = await getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    } as Record<string, string>;
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = `${API_URL}${API_BASE_PATH}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      errorService.handleError('Authentication failed (401)', {
        level: 'warning',
        source: 'auth',
        context: { endpoint }
      });
    }
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        errorService.handleError(parseError instanceof Error ? parseError : String(parseError), {
          source: 'api',
          context: {
            endpoint,
            responseText: responseText.substring(0, 100)
          }
        });
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        const errorMessage = data.message || data.error || 'API error occurred';
        
        // Handle approval-related errors with a lower severity
        const isApprovalError = isApprovalRelatedError(errorMessage);
        
        if (isApprovalError) {
          // Log as info instead of error for approval-related responses
          errorService.handleError(errorMessage, {
            source: 'api',
            level: 'info', // Lower severity for expected condition
            context: {
              endpoint,
              statusCode: response.status,
              approvalRelated: true
            }
          });
        } else {
          // Regular error handling for all other errors
          errorService.handleError(errorMessage, {
            source: 'api',
            context: {
              endpoint,
              statusCode: response.status
            }
          });
        }
        
        throw new Error(errorMessage);
      }
      
      return data;
    } else {
      const responseText = await response.text();
      
      if (!response.ok) {
        errorService.handleError(`Network response was not ok: ${response.status} ${response.statusText}`, {
          source: 'network',
          context: {
            endpoint,
            statusCode: response.status,
            statusText: response.statusText
          }
        });
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      
      return responseText;
    }
  } catch (error) {
    // Check if this is an approval-related error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isApprovalError = isApprovalRelatedError(errorMessage);
    
    if (isApprovalError) {
      // Log as info instead of error for approval-related errors
      errorService.handleError(errorMessage, {
        source: 'api',
        level: 'info', // Lower severity for expected condition
        context: { 
          endpoint, 
          method: options.method,
          approvalRelated: true 
        }
      });
    } else {
      // Regular error handling for all other errors
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'api',
        context: { endpoint, method: options.method }
      });
    }
    
    throw error;
  }
};

export const instancesApi = {
  getInstances: async () => {
    return apiRequest('/instances', { method: 'GET' });
  },
  
  getInstance: async (id: string) => {
    return apiRequest(`/instances/${id}`, { method: 'GET' });
  },
  
  createInstance: async (data: any) => {
    return apiRequest('/instances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateInstance: async (id: string, data: any) => {
    return apiRequest(`/instances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteInstance: async (id: string) => {
    return apiRequest(`/instances/${id}`, { method: 'DELETE' });
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  getUserInfo: async () => {
    return apiRequest('/auth/me', { method: 'GET' });
  },
  
  refreshToken: async (refreshToken: string = '') => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
  
  logout: async () => {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};

const api = {
  instances: instancesApi,
  auth: authApi
};

export default api;