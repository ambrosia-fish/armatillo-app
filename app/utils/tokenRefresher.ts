import { Platform } from 'react-native';
import { STORAGE_KEYS } from './storage';
import { isTokenExpired, getRefreshToken, storeAuthTokens } from './tokenUtils';
import config from '../constants/config';
import { errorService } from '../services/ErrorService';

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
      errorService.handleError('No refresh token available', {
        source: 'auth',
        level: 'warning',
        displayToUser: false,
        context: { action: 'ensureValidToken' }
      });
      return false;
    }

    // Create a single refresh promise to prevent multiple refreshes
    refreshPromise = refreshTokenFlow(refreshToken);
    const result = await refreshPromise;
    refreshPromise = null;
    return result;

  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'auth',
      level: 'warning',
      displayToUser: false,
      context: { action: 'ensureValidToken' }
    });
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
    
    // For web platform, ensure token is immediately available in localStorage
    if (Platform.OS === 'web') {
      const expiryTime = Date.now() + (data.expiresIn || config.authConfig.tokenExpiration / 1000) * 1000;
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
      
      if (data.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
    }
    
    return true;
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'auth',
      level: 'warning',
      displayToUser: false,
      context: { action: 'refreshTokenFlow' }
    });
    return false;
  }
}

export default { ensureValidToken };