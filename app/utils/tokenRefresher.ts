import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';
import { isTokenExpired, getRefreshToken, storeAuthTokens } from './tokenUtils';
import config from '../constants/config';

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
    const expired = await isTokenExpired(config.authConfig.tokenRefreshBuffer);
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
    const url = `${config.apiUrl}${config.apiBasePath}/auth/refresh`;
    
    if (config.enableLogging) {
      console.log(`Refreshing token at: ${url}`);
    }
    
    const response = await fetch(url, {
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

    if (config.enableLogging) {
      console.log('Token refreshed successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

export default { ensureValidToken };
