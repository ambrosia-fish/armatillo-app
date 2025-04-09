import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorService } from '../services/ErrorService';
import { Platform } from 'react-native';

/**
 * Storage keys used throughout the app
 * Centralized to avoid typos and ensure consistency
 */
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  TOKEN_EXPIRY: 'auth_token_expiry',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'user_data',
  USER_NAME: 'user_name',
  THEME: 'app_theme',
  ONBOARDING_COMPLETED: 'onboarding_completed',
};

/**
 * Creates a prefixed key for storage
 * This helps prevent conflicts with other apps on web
 * 
 * @param key - The original key
 * @returns The prefixed key for storage
 */
const createStorageKey = (key: string): string => {
  return `armatillo_${key}`;
};

/**
 * Storage utility functions
 * Supports both AsyncStorage for mobile and localStorage for web
 */
export const storage = {
  /**
   * Store a string value
   * 
   * @param key - The key to store the value under
   * @param value - The string value to store
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const storageKey = createStorageKey(key);
      
      // Store in AsyncStorage (works for both native and web)
      await AsyncStorage.setItem(storageKey, value);
      
      // Also store in localStorage for web
      if (Platform.OS === 'web') {
        localStorage.setItem(storageKey, value);
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        level: 'error',
        context: { action: 'setItem', key }
      });
      throw error;
    }
  },

  /**
   * Retrieve a string value
   * 
   * @param key - The key to retrieve the value for
   * @returns The stored string or null if not found
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      const storageKey = createStorageKey(key);
      
      // First try AsyncStorage (works for both native and web)
      let value = await AsyncStorage.getItem(storageKey);
      
      // If on web and not found in AsyncStorage, try localStorage
      if (value === null && Platform.OS === 'web') {
        value = localStorage.getItem(storageKey);
        
        // If found in localStorage but not in AsyncStorage, sync them
        if (value !== null) {
          try {
            await AsyncStorage.setItem(storageKey, value);
            console.log(`Synced key ${key} from localStorage to AsyncStorage`);
          } catch (syncError) {
            // Log sync error but don't throw to avoid blocking the main operation
            console.warn(`Failed to sync ${key} from localStorage to AsyncStorage:`, syncError);
          }
        }
      }
      
      return value;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        level: 'warning',
        displayToUser: false,
        context: { action: 'getItem', key }
      });
      
      // For getItem, don't throw to allow graceful fallback
      return null;
    }
  },

  /**
   * Remove a value
   * 
   * @param key - The key to remove
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      const storageKey = createStorageKey(key);
      
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(storageKey);
      
      // Also remove from localStorage for web
      if (Platform.OS === 'web') {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        level: 'warning',
        displayToUser: false,
        context: { action: 'removeItem', key }
      });
      
      // Don't throw to allow partial success
    }
  },

  /**
   * Store an object value (serialized as JSON)
   * 
   * @param key - The key to store the object under
   * @param value - The object to store
   */
  setObject: async <T>(key: string, value: T): Promise<void> => {
    try {
      // Validate the value can be serialized
      if (value === undefined) {
        throw new Error(`Cannot store undefined value for key ${key}`);
      }
      
      const jsonValue = JSON.stringify(value);
      await storage.setItem(key, jsonValue);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        level: 'error',
        context: { action: 'setObject', key }
      });
      throw error;
    }
  },

  /**
   * Retrieve an object value (parsed from JSON)
   * 
   * @param key - The key to retrieve the object for
   * @returns The stored object or null if not found
   */
  getObject: async <T>(key: string): Promise<T | null> => {
    try {
      const jsonValue = await storage.getItem(key);
      
      if (jsonValue === null) {
        return null;
      }
      
      try {
        return JSON.parse(jsonValue) as T;
      } catch (parseError) {
        errorService.handleError(parseError instanceof Error ? parseError : String(parseError), {
          source: 'storage',
          level: 'error',
          context: { action: 'parseJSON', key }
        });
        
        // If parsing fails, clear the corrupted value
        await storage.removeItem(key);
        return null;
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        level: 'warning',
        displayToUser: false,
        context: { action: 'getObject', key }
      });
      return null;
    }
  },

  /**
   * Clear all stored data
   * Use with caution - this will remove ALL data stored by the app
   */
  clear: async (): Promise<void> => {
    try {
      // Clear AsyncStorage - this will affect ALL keys, not just our app
      await AsyncStorage.clear();
      
      // For web, only clear our app's keys by using a prefix filter
      if (Platform.OS === 'web') {
        const prefix = 'armatillo_';
        
        // Get all localStorage keys
        const allKeys = Object.keys(localStorage);
        
        // Filter and remove only our app's keys
        allKeys
          .filter(key => key.startsWith(prefix))
          .forEach(key => localStorage.removeItem(key));
          
        console.log('Web localStorage cleared for app keys');
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        level: 'error',
        context: { action: 'clear' }
      });
      throw error;
    }
  },
  
  /**
   * Multi-get for items
   * More efficient than calling getItem multiple times
   * 
   * @param keys - Array of keys to retrieve
   * @returns Object with keys and their values
   */
  multiGet: async (keys: string[]): Promise<Record<string, string | null>> => {
    try {
      const storageKeys = keys.map(createStorageKey);
      const results: Record<string, string | null> = {};
      
      // For native, use the more efficient multiGet
      if (Platform.OS !== 'web') {
        const keyValuePairs = await AsyncStorage.multiGet(storageKeys);
        
        // Process pairs and build result object with original keys
        keyValuePairs.forEach((pair, index) => {
          results[keys[index]] = pair[1]; // pair is [key, value]
        });
      } else {
        // For web, we need to do it one by one
        // Try AsyncStorage first
        const asyncStorageResults = await Promise.all(
          storageKeys.map(key => AsyncStorage.getItem(key))
        );
        
        // Populate results from AsyncStorage
        storageKeys.forEach((storageKey, index) => {
          const originalKey = keys[index];
          results[originalKey] = asyncStorageResults[index];
          
          // If not found in AsyncStorage, try localStorage
          if (results[originalKey] === null) {
            results[originalKey] = localStorage.getItem(storageKey);
            
            // If found in localStorage but not AsyncStorage, sync them
            if (results[originalKey] !== null) {
              try {
                AsyncStorage.setItem(storageKey, results[originalKey] as string).catch(
                  () => console.warn(`Failed to sync ${originalKey} from localStorage to AsyncStorage`)
                );
              } catch (syncError) {
                console.warn(`Failed to sync ${originalKey} from localStorage to AsyncStorage:`, syncError);
              }
            }
          }
        });
      }
      
      return results;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        level: 'warning',
        context: { action: 'multiGet', keys: keys.join(',') }
      });
      
      // Return empty object as fallback
      return {};
    }
  },
  
  /**
   * Check if a key exists in storage
   * 
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  hasKey: async (key: string): Promise<boolean> => {
    try {
      const value = await storage.getItem(key);
      return value !== null;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'storage',
        level: 'info',
        displayToUser: false,
        context: { action: 'hasKey', key }
      });
      return false;
    }
  }
};

export default storage;