import storage, { STORAGE_KEYS } from './storage';

/**
 * Token utilities for managing authentication tokens
 */

// Default token expiration buffer (5 minutes in milliseconds)
// This provides a safety margin before actual expiration
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000;

// Default token expiration (1 hour in milliseconds)
// This is used if the server doesn't provide an expiration time
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
  // Calculate expiration timestamp
  const expiryTime = Date.now() + expiresIn * 1000;
  const expiryTimeString = expiryTime.toString();

  // Store token and expiration
  await storage.setItem(STORAGE_KEYS.TOKEN, token);
  await storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimeString);

  // Store refresh token if provided
  if (refreshToken) {
    await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  console.log(`Token stored with expiration in ${expiresIn} seconds`);
}

/**
 * Check if the stored token is expired or about to expire
 * @param bufferMs Time buffer in milliseconds (default: 5 minutes)
 * @returns True if token is expired or will expire within the buffer time
 */
export async function isTokenExpired(bufferMs: number = TOKEN_EXPIRY_BUFFER): Promise<boolean> {
  try {
    // Get expiration timestamp
    const expiryTimeString = await storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    
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
  return await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Clear all authentication tokens
 */
export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    storage.removeItem(STORAGE_KEYS.TOKEN),
    storage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
    storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
  console.log('Auth tokens cleared');
}

/**
 * Get time remaining until token expiration (in milliseconds)
 * @returns Time until expiration in milliseconds, or 0 if expired/not found
 */
export async function getTokenTimeRemaining(): Promise<number> {
  try {
    const expiryTimeString = await storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    
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
