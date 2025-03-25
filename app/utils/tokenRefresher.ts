import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';
import { isTokenExpired, getRefreshToken, storeAuthTokens } from './tokenUtils';
import { Platform } from 'react-native';

// Refresher service to handle token refresh
// This can be imported and used to ensure a valid token before API requests

let refreshPromise: Promise<boolean> | null = null;

/**
 * Check if token needs refresh and perform refresh if needed
 * @returns true if token is valid, false otherwise
 */
export async function ensureValidToken(): Promise<boolean> {
  try {
    // If a refresh is already in progress, wait for it
    if (refreshPromise) {
      return await refreshPromise;
    }

    // Check if token is expired or about to expire
    const expired = await isTokenExpired();
    if (!expired) {
      return true; // Token is still valid
    }

    // Get refresh token
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    // Create a single refresh promise to prevent multiple refreshes
    refreshPromise = refreshTokenFlow(refreshToken);
    const result = await refreshPromise;
    refreshPromise = null;
    return result;

  } catch (error) {
    console.error('Token refresh error:', error);
    refreshPromise = null;
    return false;
  }
}

/**
 * Handle token refresh flow
 * @param refreshToken The refresh token
 * @returns true if successful, false otherwise
 */
async function refreshTokenFlow(refreshToken: string): Promise<boolean> {
  try {
    const API_URL = getApiUrl();
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.token) {
      throw new Error('Invalid refresh response');
    }

    // Store new tokens
    await storeAuthTokens(
      data.token,
      data.expiresIn,
      data.refreshToken // May be the same or a new refresh token
    );

    console.log('Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * Get the API URL based on environment
 */
function getApiUrl(): string {
  // When running in development mode (local)
  if (__DEV__) {
    // Use localhost for iOS simulator and local development
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000';
    } 
    // Use 10.0.2.2 for Android emulator (this maps to localhost on the host)
    else if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    // For web development
    else if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    }
    // Fallback to development API
    return 'https://armatillo-api-development.up.railway.app';
  }
  
  // When running in production (deployed app)
  return 'https://armatillo-api-production.up.railway.app';
}

export default { ensureValidToken };