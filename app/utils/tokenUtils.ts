import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';

/**
 * Token utilities for managing authentication tokens
 */

// Default token expiration (1 hour in milliseconds)
export const DEFAULT_TOKEN_EXPIRATION = 60 * 60 * 1000;

/**
 * Store authentication tokens along with expiration time
 * @param token The JWT token
 * @param expiresIn Expiration time in seconds (from the server)
 * @param refreshToken Optional refresh token
 */
export async function storeAuthTokens(
  token: string,
  expiresIn: number = DEFAULT_TOKEN_EXPIRATION / 1000,
  refreshToken?: string
): Promise<void> {
  try {
    // Calculate expiration timestamp
    const expiryTime = Date.now() + expiresIn * 1000;
    const expiryTimeString = expiryTime.toString();

    // Store token and expiration
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimeString);

    // Store refresh token if provided
    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    console.log(`Token stored with expiration in ${expiresIn} seconds`);
  } catch (error) {
    console.error('Error storing auth tokens:', error);
    throw error;
  }
}

/**
 * Check if the stored token is expired or about to expire
 * @param bufferMs Time buffer in milliseconds (default: 5 minutes)
 * @returns True if token is expired or will expire within the buffer time
 */
export async function isTokenExpired(bufferMs: number = 5 * 60 * 1000): Promise<boolean> {
  try {
    // Get expiration timestamp
    const expiryTimeString = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    
    if (!expiryTimeString) {
      // No expiration time stored, consider token expired
      return true;
    }

    const expiryTime = parseInt(expiryTimeString, 10);
    const currentTime = Date.now();
    
    // Token is expired if current time + buffer is greater than expiry time
    const isExpired = currentTime + bufferMs >= expiryTime;
    
    if (isExpired) {
      console.log('Token is expired or will expire soon');
    }
    
    return isExpired;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // Consider token expired on error
    return true;
  }
}

/**
 * Get the stored refresh token
 * @returns The refresh token or null if not found
 */
export async function getRefreshToken(): Promise<string | null> {
  return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Clear all authentication tokens
 */
export async function clearAuthTokens(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);
    console.log('Auth tokens cleared');
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
    throw error;
  }
}

/**
 * Get time remaining until token expiration (in milliseconds)
 * @returns Time until expiration in milliseconds, or 0 if expired/not found
 */
export async function getTokenTimeRemaining(): Promise<number> {
  try {
    const expiryTimeString = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    
    if (!expiryTimeString) {
      return 0;
    }
    
    const expiryTime = parseInt(expiryTimeString, 10);
    const currentTime = Date.now();
    const remaining = Math.max(0, expiryTime - currentTime);
    
    return remaining;
  } catch (error) {
    console.error('Error getting token time remaining:', error);
    return 0;
  }
}

// Default export for compatibility with routes
export default {
  storeAuthTokens,
  isTokenExpired,
  getRefreshToken,
  clearAuthTokens,
  getTokenTimeRemaining,
  DEFAULT_TOKEN_EXPIRATION
};
