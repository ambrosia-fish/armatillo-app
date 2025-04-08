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
      // Log as info level instead of warning since this is an expected condition
      // when a user is not logged in or pending approval
      errorService.handleError('No refresh token available', {
        source: 'auth',
        level: 'info', // Changed from warning to info
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
      level: 'info', // Changed from warning to info for better readability
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
    
    return true;
  } catch (error) {
    // Check if error message contains approval-related terms
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isApprovalRelated = 
      errorMessage.includes('pre-alpha') || 
      errorMessage.includes('testing is only available') ||
      errorMessage.includes('pending approval');
    
    errorService.handleError(errorMessage, {
      source: 'auth',
      level: isApprovalRelated ? 'info' : 'warning', // Use info level for approval-related errors
      displayToUser: false,
      context: { 
        action: 'refreshTokenFlow',
        approvalRelated: isApprovalRelated
      }
    });
    
    return false;
  }
}

export default { ensureValidToken };