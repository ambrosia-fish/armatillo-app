import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorService } from '../services/ErrorService';
import { Platform } from 'react-native';

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  TOKEN_EXPIRY: 'auth_token_expiry',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'user_data',
  USER_NAME: 'user_name',
  PENDING_APPROVAL: 'pending_approval', // New key for pending approval status
};

/**
 * Storage utility functions 
 * Supports both AsyncStorage for mobile and localStorage for web
 */
export const storage = {
  /**
   * Store a string value
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
      
      // Also store in localStorage for web
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        context: { action: 'setItem', key }
      });
      throw error;
    }
  },

  /**
   * Retrieve a string value
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      let value = await AsyncStorage.getItem(key);
      
      // Try localStorage if AsyncStorage doesn't have the value
      if (value === null && Platform.OS === 'web') {
        value = localStorage.getItem(key);
      }
      
      return value;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        context: { action: 'getItem', key }
      });
      throw error;
    }
  },

  /**
   * Remove a value
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
      
      // Also remove from localStorage for web
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        displayToUser: false,
        context: { action: 'removeItem', key }
      });
    }
  },

  /**
   * Store an object value (serialized as JSON)
   */
  setObject: async <T>(key: string, value: T): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      
      // Also store in localStorage for web
      if (Platform.OS === 'web') {
        localStorage.setItem(key, jsonValue);
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        context: { action: 'setObject', key }
      });
      throw error;
    }
  },

  /**
   * Retrieve an object value (parsed from JSON)
   */
  getObject: async <T>(key: string): Promise<T | null> => {
    try {
      let jsonValue = await AsyncStorage.getItem(key);
      
      // Try localStorage if AsyncStorage doesn't have the value
      if (jsonValue === null && Platform.OS === 'web') {
        jsonValue = localStorage.getItem(key);
      }
      
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        context: { action: 'getObject', key }
      });
      throw error;
    }
  },

  /**
   * Clear all stored data
   */
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
      
      // Also clear localStorage for web
      if (Platform.OS === 'web') {
        localStorage.clear();
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        context: { action: 'clear' }
      });
      throw error;
    }
  },
};

export default storage;