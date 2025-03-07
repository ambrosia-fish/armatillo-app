import { AppState, AppStateStatus } from 'react-native';
import storage, { STORAGE_KEYS } from './storage';

// Max age of crash recovery data to be considered valid (10 minutes)
const MAX_RECOVERY_AGE = 10 * 60 * 1000; 

// Last time the app state was saved
let lastStateSaveTime = 0;

// Minimum time between state saves (to avoid excessive writes)
const MIN_STATE_SAVE_INTERVAL = 5000; // 5 seconds

// Flag to indicate if we detected a crash on startup
let crashDetected = false;

/**
 * Initialize crash detection
 * Should be called as early as possible in the app lifecycle
 */
export const initCrashDetection = async (): Promise<boolean> => {
  try {
    // Check if there's a previous session that didn't end properly
    const lastSessionData = await storage.getLastAppState();
    const lastSessionId = lastSessionData?.sessionId;
    
    // Generate a new session ID for this app launch
    await storage.resetSessionId();
    const newSessionId = await storage.getSessionId();
    
    if (lastSessionData && lastSessionId && lastSessionId !== newSessionId) {
      // Check if the last state was recent (within MAX_RECOVERY_AGE)
      const now = Date.now();
      const lastStateTime = lastSessionData.timestamp || 0;
      
      if (now - lastStateTime < MAX_RECOVERY_AGE) {
        // This could indicate a crash since the previous session wasn't properly closed
        console.log('Potential crash detected! Previous session:', lastSessionId);
        crashDetected = true;
        
        // Keep the crash recovery data available for app to handle
        await storage.setCrashRecoveryData({
          lastState: lastSessionData.state,
          timestamp: lastStateTime,
          previousSessionId: lastSessionId,
          crashDetected: true
        });
        
        return true;
      } else {
        console.log('Old session data found but expired:', lastSessionId);
        // Clear outdated session data
        await storage.clearCrashRecoveryData();
      }
    }
    
    // Setup app state change listeners to track app status
    setupAppStateTracking();
    
    return false;
  } catch (error) {
    console.error('Error in crash detection:', error);
    return false;
  }
};

/**
 * Setup tracking of app state changes
 */
const setupAppStateTracking = () => {
  AppState.addEventListener('change', handleAppStateChange);
};

/**
 * Handle app state changes
 * @param nextAppState The new app state
 */
const handleAppStateChange = async (nextAppState: AppStateStatus) => {
  try {
    if (nextAppState === 'active') {
      // App came to foreground
      console.log('App is now active');
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App is going to background or being deactivated
      // Save the current app state for potential crash recovery
      await saveCurrentAppState();
    }
  } catch (error) {
    console.error('Error handling app state change:', error);
  }
};

/**
 * Save the current app state for crash recovery
 * This should be called at key points in the app, especially when making important changes
 * @param state Optional state to save. If not provided, retrieves the current app state
 */
export const saveCurrentAppState = async (state?: any): Promise<void> => {
  try {
    const now = Date.now();
    
    // Avoid saving state too frequently
    if (now - lastStateSaveTime < MIN_STATE_SAVE_INTERVAL) {
      return;
    }
    
    lastStateSaveTime = now;
    
    // If no specific state was provided, collect important app state
    if (!state) {
      // Collect key app state for recovery
      // In a real app, you'd collect more comprehensive state
      state = {
        lastActive: now,
        // Add other important state that needs to be preserved across crashes
      };
    }
    
    await storage.saveAppState(state);
  } catch (error) {
    console.error('Error saving app state:', error);
  }
};

/**
 * Check if a crash was detected during app startup
 */
export const wasCrashDetected = (): boolean => {
  return crashDetected;
};

/**
 * Get recovery data from a previously detected crash
 */
export const getCrashRecoveryData = async (): Promise<any> => {
  return await storage.getCrashRecoveryData();
};

/**
 * Clear crash recovery data after handling the crash
 */
export const completeCrashRecovery = async (): Promise<void> => {
  try {
    await storage.clearCrashRecoveryData();
    crashDetected = false;
  } catch (error) {
    console.error('Error completing crash recovery:', error);
  }
};

/**
 * Safely cleanup partial state in case of errors
 * @param keysToKeep Optional array of keys to preserve during cleanup
 */
export const secureStateCleanup = async (keysToKeep: string[] = []): Promise<void> => {
  try {
    console.log('Performing secure state cleanup...');
    
    // Get all AsyncStorage keys
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Filter out keys we want to keep
    const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
    
    if (keysToRemove.length > 0) {
      // Remove the filtered keys
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`Removed ${keysToRemove.length} potentially corrupted keys`);
    }
    
    // Create a clean session
    await storage.resetSessionId();
    await storage.getSessionId(); // Generate a new one
    
    console.log('Secure state cleanup completed');
  } catch (error) {
    console.error('Error during secure state cleanup:', error);
  }
};

export default {
  initCrashDetection,
  saveCurrentAppState,
  wasCrashDetected,
  getCrashRecoveryData,
  completeCrashRecovery,
  secureStateCleanup
};
