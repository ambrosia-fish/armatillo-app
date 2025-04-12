import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';
import storage from './storage';
import config from '../constants/config';
import { errorService } from '../services/ErrorService';
import { Platform } from 'react-native';

export const DEFAULT_TOKEN_EXPIRATION = config.authConfig.tokenExpiration;

/**
 * Stores authentication tokens in storage
 * Handles both AsyncStorage and localStorage for web
 * 
 * @param token - The authentication token
 * @param expiresIn - Token expiration time in seconds
 * @param refreshToken - Optional refresh token
 */
export async function storeAuthTokens(
  token: string,
  expiresIn: number = DEFAULT_TOKEN_EXPIRATION / 1000,
  refreshToken?: string
): Promise<void> {
  try {
    if (!token) {
      throw new Error('Cannot store empty token');
    }
    
    // Calculate expiry time
    const expiryTime = Date.now() + expiresIn * 1000;
    const expiryTimeString = expiryTime.toString();

    // Store token and expiry
    await storage.setItem(STORAGE_KEYS.TOKEN, token);
    await storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimeString);

    // Store refresh token if provided
    if (refreshToken) {
      await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    
    // Log success for debugging
    console.log('Auth tokens stored successfully. Expires in:', expiresIn, 'seconds');
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      level: 'error',
      context: { action: 'storeAuthTokens' }
    });
    throw error;
  }
}

/**
 * Checks if the current token is expired or about to expire
 * 
 * @param bufferMs - Buffer time in milliseconds before actual expiry
 * @returns True if token is expired or will expire soon, false otherwise
 */
export async function isTokenExpired(
  bufferMs: number = config.authConfig.tokenRefreshBuffer
): Promise<boolean> {
  try {
    // Get expiry time from storage
    const expiryTimeString = await storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    
    // If no expiry time found, consider token expired
    if (!expiryTimeString) {
      return true;
    }

    // Parse expiry time and compare with current time
    const expiryTime = parseInt(expiryTimeString, 10);
    if (isNaN(expiryTime)) {
      console.warn('Invalid token expiry time found:', expiryTimeString);
      return true;
    }
    
    const currentTime = Date.now();
    const isExpired = currentTime + bufferMs >= expiryTime;
    
    if (isExpired) {
      console.log('Token is expired or will expire soon. Current time:', new Date(currentTime).toISOString(), 
                 'Expiry time:', new Date(expiryTime).toISOString());
    }
    
    return isExpired;
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      level: 'warning',
      displayToUser: false,
      context: { action: 'isTokenExpired' }
    });
    // If we can't determine if token is expired, assume it is for safety
    return true;
  }
}

/**
 * Clears all authentication tokens from storage
 */
export async function clearAuthTokens(): Promise<void> {
  try {
    console.log('Clearing auth tokens...');
    
    // Clear tokens from storage using Promise.all for efficiency
    const clearPromises = [
      storage.removeItem(STORAGE_KEYS.TOKEN),
      storage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
      storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      storage.removeItem(STORAGE_KEYS.USER),
      storage.removeItem(STORAGE_KEYS.USER_NAME)
    ];
    
    await Promise.all(clearPromises);
    console.log('Auth tokens cleared successfully');
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      level: 'error',
      context: { action: 'clearAuthTokens' }
    });
    
    // Even if there's an error, still try to clear tokens directly
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.USER_NAME);
      }
      
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.TOKEN_EXPIRY,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.USER_NAME
      ]);
    } catch (fallbackError) {
      console.error('Failed to clear tokens in fallback:', fallbackError);
    }
    
    throw error;
  }
}

/**
 * Gets the refresh token from storage
 * 
 * @returns The refresh token if found, null otherwise
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      level: 'warning',
      displayToUser: false,
      context: { action: 'getRefreshToken' }
    });
    return null;
  }
}

/**
 * Gets the authentication token from storage
 * 
 * @returns The authentication token if found, null otherwise
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await storage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      level: 'warning',
      displayToUser: false,
      context: { action: 'getAuthToken' }
    });
    return null;
  }
}

/**
 * Checks if all required auth tokens are present
 * 
 * @returns True if all auth tokens are present, false otherwise
 */
export async function hasAuthTokens(): Promise<boolean> {
  try {
    const token = await storage.getItem(STORAGE_KEYS.TOKEN);
    const expiryTime = await storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    
    return !!token && !!expiryTime;
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      level: 'warning',
      displayToUser: false,
      context: { action: 'hasAuthTokens' }
    });
    return false;
  }
}

export default {
  storeAuthTokens,
  isTokenExpired,
  clearAuthTokens,
  getRefreshToken,
  getAuthToken,
  hasAuthTokens,
  DEFAULT_TOKEN_EXPIRATION
};