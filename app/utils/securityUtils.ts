import * as Crypto from 'expo-crypto';
import storage, { STORAGE_KEYS } from './storage';

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
  
  // Use crypto.getRandomValues for secure random generation
  const randomValues = new Uint8Array(length);
  
  try {
    // Use native crypto API for secure random generation
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
  } catch (error) {
    // If the native crypto API fails, use expo-crypto's getRandomBytes as a fallback
    console.warn('Native crypto.getRandomValues failed, using expo-crypto fallback');
    
    // Generate a completely new set of random values
    for (let i = 0; i < length; i++) {
      // Use a high-entropy source to generate each character
      const randomIndex = Math.floor(Crypto.getRandomBytes(1)[0] % chars.length);
      result += chars[randomIndex];
    }
  }
  
  return result;
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
    console.log(`Generated new OAuth state: ${state}`);
    
    // Store it in secure storage
    await storage.setItem(SECURITY_KEYS.OAUTH_STATE, state);
    
    // Verify it was stored correctly
    const storedState = await storage.getItem(SECURITY_KEYS.OAUTH_STATE);
    if (storedState !== state) {
      console.warn(`Warning: Stored state (${storedState}) doesn't match generated state (${state})`);
    } else {
      console.log('OAuth state successfully stored in secure storage');
    }
    
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
    
    console.log(`Verifying OAuth state: ${callbackState}`);
    
    // Get the stored state
    const storedState = await storage.getItem(SECURITY_KEYS.OAUTH_STATE);
    
    // If no stored state, fail validation
    if (!storedState) {
      console.error('No stored state parameter found in secure storage');
      return false;
    }
    
    console.log(`Stored state: ${storedState}`);
    console.log(`Callback state: ${callbackState}`);
    
    // Compare stored state with callback state
    const isValid = storedState === callbackState;
    
    // Clear the stored state regardless of outcome (one-time use)
    await storage.removeItem(SECURITY_KEYS.OAUTH_STATE);
    console.log('Cleared stored OAuth state');
    
    if (!isValid) {
      console.error(`OAuth state validation failed: stored=${storedState}, callback=${callbackState}`);
    } else {
      console.log('OAuth state validation successful');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying OAuth state:', error);
    
    // If there's an error during verification, fail safe
    return false;
  }
}

/**
 * Base64 URL encode a string
 * @param str The input string to encode
 * @returns The base64 URL encoded string
 */
export function base64UrlEncode(str: string | ArrayBuffer): string {
  let base64;
  
  // Handle string vs ArrayBuffer input
  if (typeof str === 'string') {
    // Encode the string to base64
    base64 = btoa(str);
  } else {
    // Convert ArrayBuffer to a string
    const bytes = new Uint8Array(str);
    const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    base64 = btoa(binary);
  }
  
  // Convert base64 to base64url encoding
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate a code challenge from a code verifier using SHA-256
 * @param codeVerifier The code verifier string
 * @returns Promise resolving to the code challenge string
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  try {
    // Generate the SHA-256 hash of the code verifier
    const hashBuffer = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier
    );
    
    // Base64url encode the hash
    return base64UrlEncode(hashBuffer);
  } catch (error) {
    console.error('Error generating code challenge:', error);
    throw error;
  }
}

/**
 * Generate PKCE code verifier and code challenge
 * For OAuth security against code interception attacks
 * @returns Promise resolving to an object with code verifier and code challenge
 */
export async function generatePKCEChallenge(): Promise<{ codeVerifier: string, codeChallenge: string }> {
  try {
    console.log('Generating PKCE challenge...');
    
    // Generate code verifier (random string between 43-128 chars)
    // RFC 7636 recommends at least 43 characters, we use 64 for good security
    const codeVerifier = generateRandomString(64);
    console.log(`Generated code verifier (length ${codeVerifier.length})`);
    
    // Store the code verifier securely
    await storage.setItem(SECURITY_KEYS.CODE_VERIFIER, codeVerifier);
    
    // Generate code challenge using SHA-256
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    console.log(`Generated code challenge using SHA-256: ${codeChallenge}`);
    
    return { codeVerifier, codeChallenge };
  } catch (error) {
    console.error('Failed to generate PKCE challenge:', error);
    throw error;
  }
}

/**
 * Get the stored code verifier for PKCE token exchange
 * @returns Promise resolving to the code verifier or null if not found
 */
export async function getStoredCodeVerifier(): Promise<string | null> {
  try {
    return await storage.getItem(SECURITY_KEYS.CODE_VERIFIER);
  } catch (error) {
    console.error('Error getting stored code verifier:', error);
    return null;
  }
}

/**
 * Clear the stored code verifier
 * Should be called after token exchange is complete
 */
export async function clearCodeVerifier(): Promise<void> {
  try {
    await storage.removeItem(SECURITY_KEYS.CODE_VERIFIER);
    console.log('Code verifier cleared');
  } catch (error) {
    console.error('Error clearing code verifier:', error);
  }
}

// Default export for compatibility with routes
export default {
  generateRandomString,
  generateOAuthState,
  verifyOAuthState,
  generatePKCEChallenge,
  getStoredCodeVerifier,
  clearCodeVerifier,
  base64UrlEncode,
  SECURITY_KEYS
};
