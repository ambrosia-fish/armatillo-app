import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorService } from '../services/ErrorService';

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
 * Simplified version that uses AsyncStorage directly
 */
export const storage = {
  /**
   * Store a string value
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
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
      return await AsyncStorage.getItem(key);
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
      const jsonValue = await AsyncStorage.getItem(key);
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