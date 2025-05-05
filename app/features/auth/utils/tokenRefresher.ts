import { isTokenExpired, getRefreshToken, storeAuthTokens, getAuthToken } from './tokenUtils';
import config from '@/app/config';
import { errorService } from '@/app/services/error';

// Global refresh promise to prevent multiple refreshes
let refreshPromise: Promise<boolean> | null = null;

// Debounce period to prevent excessive refresh attempts
const REFRESH_DEBOUNCE_MS = 1000;
let lastRefreshAttempt = 0;

/**
 * Check if token needs refresh and perform refresh if needed
 * @returns true if token is valid, false otherwise
 */
export async function ensureValidToken(): Promise<boolean> {
  try {
    // Check if token exists
    const token = await getAuthToken();
    if (!token) {
      return false;
    }
    
    // If a refresh is already in progress, wait for it
    if (refreshPromise) {
      return await refreshPromise;
    }

    // Check if token is expired or about to expire
    const expired = await isTokenExpired(config.authConfig.tokenRefreshBuffer);
    if (!expired) {
      return true; // Token is still valid
    }

    // Debounce refresh attempts
    const now = Date.now();
    if (now - lastRefreshAttempt < REFRESH_DEBOUNCE_MS) {
      console.log('Refresh attempt debounced, using existing refresh promise or creating new one');
      if (refreshPromise) {
        return await refreshPromise;
      }
    }
    
    lastRefreshAttempt = now;

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
    console.log('Starting token refresh process');
    refreshPromise = refreshTokenFlow(refreshToken);
    
    // Wait for result and clear promise
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
    
    // Clear refresh promise to allow future attempts
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
    
    console.log('Refreshing token at:', url);
    
    // Make refresh token request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    // Handle non-success response
    if (!response.ok) {
      const statusText = response.statusText || `Status code: ${response.status}`;
      console.error('Refresh token request failed:', statusText);
      
      // Log more details for debugging
      try {
        const errorData = await response.text();
        console.error('Error response:', errorData);
      } catch (e) {
        // Ignore error reading response
      }
      
      throw new Error(`Refresh failed: ${statusText}`);
    }

    // Parse response
    const data = await response.json();
    
    // Validate response
    if (!data.success || !data.token) {
      console.error('Invalid refresh response:', JSON.stringify(data).substring(0, 200));
      throw new Error('Invalid refresh response');
    }

    console.log('Token refresh successful');
    
    // Store new tokens
    await storeAuthTokens(
      data.token,
      data.expiresIn || config.authConfig.tokenExpiration / 1000,
      data.refreshToken || refreshToken // Use new refresh token if provided, otherwise reuse existing
    );
    
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

/**
 * Reset the refresh state - useful after logout or for testing
 */
export function resetRefreshState(): void {
  refreshPromise = null;
  lastRefreshAttempt = 0;
}

export default { ensureValidToken, resetRefreshState };