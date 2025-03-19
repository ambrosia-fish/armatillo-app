/**
 * Web-compatible storage implementation
 * This file provides web-compatible alternatives to SecureStore operations
 * for when the app is running in a web browser environment.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Prefix for items that would normally be in SecureStore
const SECURE_PREFIX = 'secure_';

/**
 * Get an item from storage
 * Uses localStorage for web platform with naming conventions
 */
export const getItemAsync = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      // For web, we just use AsyncStorage with a special prefix
      return await AsyncStorage.getItem(`${SECURE_PREFIX}${key}`);
    } else {
      // This should never be called on native platforms
      console.warn('webStorage.getItemAsync called on non-web platform');
      return null;
    }
  } catch (error) {
    console.error('Error in webStorage.getItemAsync:', error);
    return null;
  }
};

/**
 * Set an item in storage
 * Uses localStorage for web platform with naming conventions
 */
export const setItemAsync = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // For web, we just use AsyncStorage with a special prefix
      await AsyncStorage.setItem(`${SECURE_PREFIX}${key}`, value);
    } else {
      // This should never be called on native platforms
      console.warn('webStorage.setItemAsync called on non-web platform');
    }
  } catch (error) {
    console.error('Error in webStorage.setItemAsync:', error);
  }
};

/**
 * Delete an item from storage
 * Uses localStorage for web platform with naming conventions
 */
export const deleteItemAsync = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // For web, we just use AsyncStorage with a special prefix
      await AsyncStorage.removeItem(`${SECURE_PREFIX}${key}`);
    } else {
      // This should never be called on native platforms
      console.warn('webStorage.deleteItemAsync called on non-web platform');
    }
  } catch (error) {
    console.error('Error in webStorage.deleteItemAsync:', error);
  }
};

export default {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
};
