import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  TOKEN_EXPIRY: 'auth_token_expiry',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'user_data',
  USER_NAME: 'user_name',
};

// List of keys that should be stored securely
const SECURE_KEYS = [
  STORAGE_KEYS.TOKEN,
  STORAGE_KEYS.TOKEN_EXPIRY,
  STORAGE_KEYS.REFRESH_TOKEN,
  STORAGE_KEYS.USER,
];

// Additional keys that should be cleared during logout (including security-related keys)
const ADDITIONAL_CLEAR_KEYS = [
  'oauth_state',
  'pkce_code_verifier',
  // Add any other keys that might be used for auth/sessions
];

// Check if a key should be stored securely
const isSecureKey = (key: string): boolean => {
  return SECURE_KEYS.includes(key);
};

/**
 * Storage utility functions to abstract the storage mechanism
 * This allows us to swap between different storage implementations (SecureStore, AsyncStorage, etc.)
 */
export const storage = {
  /**
   * Store a string value
   * Uses SecureStore for sensitive data (tokens), AsyncStorage for non-sensitive data
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Ensure value is a string for SecureStore
      if (typeof value !== 'string') {
        value = String(value);
      }
      
      if (isSecureKey(key)) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  },

  /**
   * Retrieve a string value
   * Uses SecureStore for sensitive data (tokens), AsyncStorage for non-sensitive data
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isSecureKey(key)) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      throw error;
    }
  },

  /**
   * Remove a value
   * Uses SecureStore for sensitive data (tokens), AsyncStorage for non-sensitive data
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      if (isSecureKey(key)) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      // Don't throw here, just log the error
    }
  },

  /**
   * Store an object value (serialized as JSON)
   * Uses SecureStore for sensitive data (user info), AsyncStorage for non-sensitive data
   */
  setObject: async <T>(key: string, value: T): Promise<void> => {
    try {
      // Always stringify the object to ensure we're storing a string
      const jsonValue = JSON.stringify(value);
      
      if (isSecureKey(key)) {
        if (typeof jsonValue !== 'string') {
          throw new Error(`Cannot store non-string value in SecureStore for key: ${key}`);
        }
        await SecureStore.setItemAsync(key, jsonValue);
      } else {
        await AsyncStorage.setItem(key, jsonValue);
      }
    } catch (error) {
      console.error(`Error storing object ${key}:`, error);
      throw error;
    }
  },

  /**
   * Retrieve an object value (parsed from JSON)
   * Uses SecureStore for sensitive data (user info), AsyncStorage for non-sensitive data
   */
  getObject: async <T>(key: string): Promise<T | null> => {
    try {
      let jsonValue;
      if (isSecureKey(key)) {
        jsonValue = await SecureStore.getItemAsync(key);
      } else {
        jsonValue = await AsyncStorage.getItem(key);
      }
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving object ${key}:`, error);
      throw error;
    }
  },

  /**
   * Clear all stored data
   * Clears both AsyncStorage and SecureStore
   */
  clear: async (): Promise<void> => {
    let asyncStorageCleared = false;
    let secureStoreCleared = false;

    // Clear AsyncStorage
    try {
      await AsyncStorage.clear();
      asyncStorageCleared = true;
      console.log('AsyncStorage cleared');
    } catch (asyncError) {
      console.warn('Error clearing AsyncStorage:', asyncError);
      // Try to clear individual keys instead
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        if (allKeys && allKeys.length > 0) {
          await AsyncStorage.multiRemove(allKeys);
          asyncStorageCleared = true;
          console.log('AsyncStorage cleared using multiRemove');
        }
      } catch (multiError) {
        console.warn('Error with AsyncStorage.multiRemove:', multiError);
      }
    }
    
    // Clear all SecureStore keys (both defined and additional ones)
    const allSecureKeys = [...SECURE_KEYS, ...ADDITIONAL_CLEAR_KEYS];
    
    // Delete each key individually from SecureStore
    let secureKeyErrors = 0;
    for (const key of allSecureKeys) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (err) {
        secureKeyErrors++;
        // Just log, don't throw - we want to try all keys
        console.warn(`Could not delete secure key ${key}:`, err);
      }
    }
    
    // Mark secure store as cleared if we didn't have errors for all keys
    if (secureKeyErrors < allSecureKeys.length) {
      secureStoreCleared = true;
      console.log('SecureStore cleared');
    }
    
    // Consider the operation successful if at least one type of storage was cleared
    if (asyncStorageCleared || secureStoreCleared) {
      console.log('Storage completely cleared');
    } else {
      console.error('Failed to clear any storage');
    }
  },
};

export default storage;
