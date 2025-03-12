import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { encryptString, decryptString, encryptObject, decryptObject } from './encryptionUtils';

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  TOKEN_EXPIRY: 'auth_token_expiry',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'user_data',
  USER_NAME: 'user_name',
  // Add crash recovery keys
  CRASH_RECOVERY: 'crash_recovery_data',
  LAST_KNOWN_STATE: 'last_known_app_state',
  APP_SESSION_ID: 'app_session_id',
};

// List of keys that should be stored securely
const SECURE_KEYS = [
  STORAGE_KEYS.TOKEN,
  STORAGE_KEYS.TOKEN_EXPIRY,
  STORAGE_KEYS.REFRESH_TOKEN,
  STORAGE_KEYS.USER,
];

// List of keys that should be encrypted (but not in SecureStore)
// These are personal but non-sensitive data
const ENCRYPTED_KEYS = [
  STORAGE_KEYS.USER_NAME,
  STORAGE_KEYS.LAST_KNOWN_STATE,
  STORAGE_KEYS.CRASH_RECOVERY,
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

// Check if a key should be encrypted
const shouldEncrypt = (key: string): boolean => {
  return ENCRYPTED_KEYS.includes(key) && !isSecureKey(key);
};

/**
 * Storage utility functions to abstract the storage mechanism
 * This allows us to swap between different storage implementations (SecureStore, AsyncStorage, etc.)
 */
export const storage = {
  /**
   * Store a string value
   * Uses SecureStore for sensitive data (tokens), AsyncStorage for non-sensitive data
   * Encrypts personal but non-sensitive data
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Ensure value is a string for SecureStore
      if (typeof value !== 'string') {
        value = String(value);
      }
      
      if (isSecureKey(key)) {
        await SecureStore.setItemAsync(key, value);
      } else if (shouldEncrypt(key)) {
        // Encrypt personal but non-sensitive data
        const encryptedValue = await encryptString(value);
        await AsyncStorage.setItem(key, encryptedValue);
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
   * Decrypts encrypted personal data
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isSecureKey(key)) {
        return await SecureStore.getItemAsync(key);
      } else if (shouldEncrypt(key)) {
        // Get and decrypt personal data
        const encryptedValue = await AsyncStorage.getItem(key);
        if (!encryptedValue) return null;
        return await decryptString(encryptedValue);
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
   * Encrypts personal but non-sensitive data
   */
  setObject: async <T>(key: string, value: T): Promise<void> => {
    try {
      if (isSecureKey(key)) {
        // Always stringify the object to ensure we're storing a string
        const jsonValue = JSON.stringify(value);
        
        if (typeof jsonValue !== 'string') {
          throw new Error(`Cannot store non-string value in SecureStore for key: ${key}`);
        }
        await SecureStore.setItemAsync(key, jsonValue);
      } else if (shouldEncrypt(key)) {
        // Encrypt the object before storing
        const encryptedValue = await encryptObject(value);
        await AsyncStorage.setItem(key, encryptedValue);
      } else {
        const jsonValue = JSON.stringify(value);
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
   * Decrypts encrypted objects
   */
  getObject: async <T>(key: string): Promise<T | null> => {
    try {
      let jsonValue;
      
      if (isSecureKey(key)) {
        jsonValue = await SecureStore.getItemAsync(key);
      } else if (shouldEncrypt(key)) {
        // Get and decrypt encrypted object
        const encryptedValue = await AsyncStorage.getItem(key);
        if (!encryptedValue) return null;
        return await decryptObject(encryptedValue);
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
   * Store crash recovery data
   * @param data Any data that should be preserved across a crash
   */
  setCrashRecoveryData: async (data: any): Promise<void> => {
    try {
      // Add timestamp to the data
      const recoveryData = {
        ...data,
        timestamp: Date.now()
      };
      
      await storage.setObject(STORAGE_KEYS.CRASH_RECOVERY, recoveryData);
    } catch (error) {
      console.error('Error storing crash recovery data:', error);
    }
  },

  /**
   * Get crash recovery data
   * @returns The previously stored crash recovery data, or null if none exists
   */
  getCrashRecoveryData: async (): Promise<any> => {
    try {
      return await storage.getObject(STORAGE_KEYS.CRASH_RECOVERY);
    } catch (error) {
      console.error('Error retrieving crash recovery data:', error);
      return null;
    }
  },

  /**
   * Clear crash recovery data
   */
  clearCrashRecoveryData: async (): Promise<void> => {
    try {
      await storage.removeItem(STORAGE_KEYS.CRASH_RECOVERY);
    } catch (error) {
      console.error('Error clearing crash recovery data:', error);
    }
  },

  /**
   * Store the current app state
   * @param state Current application state to preserve
   */
  saveAppState: async (state: any): Promise<void> => {
    try {
      // Store with timestamp and session ID
      const stateData = {
        state,
        timestamp: Date.now(),
        sessionId: await storage.getSessionId()
      };
      
      await storage.setObject(STORAGE_KEYS.LAST_KNOWN_STATE, stateData);
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  },

  /**
   * Get the last saved app state
   */
  getLastAppState: async (): Promise<any> => {
    try {
      return await storage.getObject(STORAGE_KEYS.LAST_KNOWN_STATE);
    } catch (error) {
      console.error('Error retrieving last app state:', error);
      return null;
    }
  },

  /**
   * Get or create a unique session ID for the current app session
   */
  getSessionId: async (): Promise<string> => {
    try {
      let sessionId = await storage.getItem(STORAGE_KEYS.APP_SESSION_ID);
      
      if (!sessionId) {
        // Generate a new session ID
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
        await storage.setItem(STORAGE_KEYS.APP_SESSION_ID, sessionId);
      }
      
      return sessionId;
    } catch (error) {
      console.error('Error with session ID:', error);
      return 'fallback_session_' + Date.now();
    }
  },

  /**
   * Reset the session ID (to be called on app restart)
   */
  resetSessionId: async (): Promise<void> => {
    try {
      await storage.removeItem(STORAGE_KEYS.APP_SESSION_ID);
    } catch (error) {
      console.error('Error resetting session ID:', error);
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
    
    // Also reset the session ID
    await storage.resetSessionId();
    
    // Consider the operation successful if at least one type of storage was cleared
    if (asyncStorageCleared || secureStoreCleared) {
      console.log('Storage completely cleared');
    } else {
      console.error('Failed to clear any storage');
    }
  },
};

export default storage;
