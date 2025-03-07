import storage, { STORAGE_KEYS } from './storage';
import * as Crypto from 'expo-crypto';

/**
 * Token utilities for managing authentication tokens
 */

// Default token expiration buffer (5 minutes in milliseconds)
// This provides a safety margin before actual expiration
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000;

// Default token expiration (1 hour in milliseconds)
// This is used if the server doesn't provide an expiration time
export const DEFAULT_TOKEN_EXPIRATION = 60 * 60 * 1000;

// Key for storing blacklisted tokens
const BLACKLISTED_TOKENS_KEY = 'blacklisted_tokens';

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
    await storage.setItem(STORAGE_KEYS.TOKEN, token);
    await storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimeString);

    // Store refresh token if provided
    if (refreshToken) {
      await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    // Calculate and store token signature for future verification
    await storeTokenSignature(token);

    console.log(`Token stored with expiration in ${expiresIn} seconds`);
  } catch (error) {
    console.error('Error storing auth tokens:', error);
    throw error;
  }
}

/**
 * Calculate and store token signature for verification
 * @param token JWT token
 */
export async function storeTokenSignature(token: string): Promise<void> {
  try {
    // Calculate a hash of the token for later validation
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      token
    );
    
    // Store the signature securely
    await storage.setItem('token_signature', signature);
    
    console.log('Token signature stored for verification');
  } catch (error) {
    console.error('Error storing token signature:', error);
  }
}

/**
 * Verify token signature before use to detect tampering
 * @param token JWT token to verify
 * @returns True if token signature is valid
 */
export async function verifyTokenSignature(token: string): Promise<boolean> {
  try {
    // If there's no token, verification fails
    if (!token) return false;
    
    // Calculate current signature
    const currentSignature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      token
    );
    
    // Get stored signature
    const storedSignature = await storage.getItem('token_signature');
    
    // If no stored signature, verification fails
    if (!storedSignature) return false;
    
    // Compare signatures
    return currentSignature === storedSignature;
  } catch (error) {
    console.error('Error verifying token signature:', error);
    return false;
  }
}

/**
 * Add a token to the blacklist
 * @param token Token to blacklist
 * @param reason Optional reason for blacklisting
 */
export async function blacklistToken(token: string, reason?: string): Promise<void> {
  try {
    if (!token) return;
    
    // Calculate token fingerprint (we don't store the full token for security)
    const tokenFingerprint = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      token
    );
    
    // Get existing blacklist
    let blacklist = await getBlacklistedTokens();
    
    // Add new token to blacklist with timestamp and reason
    blacklist.push({
      fingerprint: tokenFingerprint,
      blacklistedAt: Date.now(),
      reason: reason || 'security_measure'
    });
    
    // Clean up old entries (tokens older than 90 days)
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    blacklist = blacklist.filter(item => item.blacklistedAt > ninetyDaysAgo);
    
    // Store updated blacklist
    await storage.setObject(BLACKLISTED_TOKENS_KEY, blacklist);
    
    console.log('Token blacklisted successfully');
  } catch (error) {
    console.error('Error blacklisting token:', error);
  }
}

/**
 * Check if a token is blacklisted
 * @param token Token to check
 * @returns True if token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    if (!token) return true; // No token is treated as blacklisted
    
    // Calculate token fingerprint
    const tokenFingerprint = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      token
    );
    
    // Get blacklist
    const blacklist = await getBlacklistedTokens();
    
    // Check if token fingerprint exists in blacklist
    return blacklist.some(item => item.fingerprint === tokenFingerprint);
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return true; // Fail closed - treat as blacklisted on error
  }
}

/**
 * Get the list of blacklisted tokens
 * @returns Array of blacklisted token entries
 */
export async function getBlacklistedTokens(): Promise<any[]> {
  try {
    const blacklist = await storage.getObject<any[]>(BLACKLISTED_TOKENS_KEY);
    return blacklist || [];
  } catch (error) {
    console.error('Error getting blacklisted tokens:', error);
    return [];
  }
}

/**
 * Clear the token blacklist
 */
export async function clearBlacklist(): Promise<void> {
  try {
    await storage.removeItem(BLACKLISTED_TOKENS_KEY);
    console.log('Token blacklist cleared');
  } catch (error) {
    console.error('Error clearing token blacklist:', error);
  }
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
 * Perform complete token validation (checks expiration, signature, and blacklist)
 * @param token JWT token to validate
 * @returns True if token is valid, false otherwise
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    if (!token) return false;
    
    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      console.log('Token is blacklisted');
      return false;
    }
    
    // Verify token signature
    const validSignature = await verifyTokenSignature(token);
    if (!validSignature) {
      console.log('Token signature validation failed');
      // If signature invalid, blacklist the token
      await blacklistToken(token, 'invalid_signature');
      return false;
    }
    
    // Check expiration
    const expired = await isTokenExpired();
    if (expired) {
      // Token is expired, but no need to blacklist
      // (normal expiration is not a security issue)
      return false;
    }
    
    // All checks passed
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
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
  try {
    await Promise.all([
      storage.removeItem(STORAGE_KEYS.TOKEN),
      storage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
      storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      storage.removeItem('token_signature'),
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

/**
 * Report token as compromised - blacklist it and clear auth state
 * @param token Token to report as compromised
 * @param reason Reason for compromise
 */
export async function reportCompromisedToken(token: string, reason: string): Promise<void> {
  try {
    console.log(`Reporting token as compromised: ${reason}`);
    
    // Blacklist the token
    await blacklistToken(token, reason);
    
    // Clear auth state
    await clearAuthTokens();
    
    console.log('Token reported as compromised and auth state cleared');
  } catch (error) {
    console.error('Error reporting compromised token:', error);
  }
}

// Default export for compatibility with routes
export default {
  storeAuthTokens,
  isTokenExpired,
  getRefreshToken,
  clearAuthTokens,
  getTokenTimeRemaining,
  DEFAULT_TOKEN_EXPIRATION,
  verifyTokenSignature,
  validateToken,
  blacklistToken,
  isTokenBlacklisted,
  getBlacklistedTokens,
  clearBlacklist,
  reportCompromisedToken
};
