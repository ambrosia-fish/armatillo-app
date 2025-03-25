import * as Crypto from 'expo-crypto';
import storage from './storage';

// Add new storage keys for security parameters
export const SECURITY_KEYS = {
  OAUTH_STATE: 'oauth_state',
  CODE_VERIFIER: 'pkce_code_verifier',
};

/**
 * Generate a cryptographically secure random string of specified length
 * Used for generating OAuth state and PKCE code verifier
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  
  try {
    // Use Crypto to generate random bytes
    const randomBytes = Crypto.getRandomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomBytes[i] % chars.length];
    }
    
    return result;
  } catch (error) {
    console.error('Error generating random string:', error);
    
    // Fallback to a less secure method in case of error
    console.warn('Using fallback method for random string generation');
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    
    return result;
  }
}

/**
 * Generate and store OAuth state parameter
 * @returns The generated state string
 */
export async function generateOAuthState(): Promise<string> {
  try {
    // First, clear any existing state to prevent issues
    await storage.removeItem(SECURITY_KEYS.OAUTH_STATE);
    
    // Generate a new random state
    const state = generateRandomString(32);
    
    // Store it in storage
    await storage.setItem(SECURITY_KEYS.OAUTH_STATE, state);
    
    return state;
  } catch (error) {
    console.error('Error generating OAuth state:', error);
    
    // Return a state even if storage fails - this is better than nothing
    return generateRandomString(32);
  }
}

/**
 * Verify OAuth state parameter from callback
 * @param callbackState The state parameter from the OAuth callback
 * @returns True if state is valid, false otherwise
 */
export async function verifyOAuthState(callbackState: string | null): Promise<boolean> {
  try {
    // If no callback state provided, fail validation
    if (!callbackState) {
      console.error('No state parameter in OAuth callback');
      return false;
    }
    
    // Get the stored state
    const storedState = await storage.getItem(SECURITY_KEYS.OAUTH_STATE);
    
    // If no stored state, fail validation
    if (!storedState) {
      console.error('No stored state parameter found in storage');
      return false;
    }
    
    // Compare stored state with callback state
    const isValid = storedState === callbackState;
    
    // Clear the stored state regardless of outcome (one-time use)
    await storage.removeItem(SECURITY_KEYS.OAUTH_STATE);
    
    return isValid;
  } catch (error) {
    console.error('Error verifying OAuth state:', error);
    
    // If there's an error during verification, fail safe
    return false;
  }
}

// Default export for compatibility with routes
export default {
  generateRandomString,
  generateOAuthState,
  verifyOAuthState,
  SECURITY_KEYS
};
