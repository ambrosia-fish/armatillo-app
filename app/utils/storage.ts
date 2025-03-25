import AsyncStorage from '@react-native-async-storage/async-storage';

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
      console.error(`Error storing ${key}:`, error);
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
      console.error(`Error retrieving ${key}:`, error);
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
      console.error(`Error removing ${key}:`, error);
      // Don't throw here, just log the error
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
      console.error(`Error storing object ${key}:`, error);
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
   */
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
      console.log('Storage completely cleared');
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};

export default storage;
