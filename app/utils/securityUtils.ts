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
  
  try {
    // Use Crypto to generate random bytes
    const randomBytes = Crypto.getRandomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomBytes[i] % chars.length];
    }
    
    console.log(`Generated random string of length ${length}`);
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
 * Base64 URL encode a string or buffer
 * Correctly implements the RFC 7636 requirements for PKCE code challenge
 * @param input The input string or buffer to encode
 * @returns The base64 URL encoded string
 */
export function base64UrlEncode(input: string | ArrayBuffer): string {
  if (typeof input === 'string') {
    // For string input directly use the digest function with SHA-256
    // This function is intended to be used with ArrayBuffer from SHA-256 digest
    // so string inputs should already be hashed somewhere else
    const encoder = new TextEncoder();
    input = encoder.encode(input).buffer;
  }
  
  // Convert ArrayBuffer to Base64
  const bytes = new Uint8Array(input);
  let base64 = '';
  
  // Convert bytes to characters and create base64 string
  const byteToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;
  
  // Process 3 bytes at a time
  for (let i = 0; i < mainLength; i += 3) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    base64 += byteToCharMap[(chunk >> 18) & 63];
    base64 += byteToCharMap[(chunk >> 12) & 63];
    base64 += byteToCharMap[(chunk >> 6) & 63];
    base64 += byteToCharMap[chunk & 63];
  }
  
  // Handle the remaining bytes
  if (byteRemainder === 1) {
    const chunk = bytes[mainLength];
    base64 += byteToCharMap[(chunk >> 2)];
    base64 += byteToCharMap[(chunk << 4) & 63];
    base64 += '=='; // Add padding
  } else if (byteRemainder === 2) {
    const chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    base64 += byteToCharMap[chunk >> 10];
    base64 += byteToCharMap[(chunk >> 4) & 63];
    base64 += byteToCharMap[(chunk << 2) & 63];
    base64 += '='; // Add padding
  }
  
  // Now convert to base64url encoding
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
    const codeChallenge = base64UrlEncode(hashBuffer);
    
    console.log(`Code verifier: ${codeVerifier}`);
    console.log(`Generated code challenge: ${codeChallenge}`);
    
    return codeChallenge;
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
    console.log(`Generated code verifier (length ${codeVerifier.length}): ${codeVerifier}`);
    
    // Store the code verifier securely
    await storage.setItem(SECURITY_KEYS.CODE_VERIFIER, codeVerifier);
    
    // Verify it was stored correctly
    const storedVerifier = await storage.getItem(SECURITY_KEYS.CODE_VERIFIER);
    if (storedVerifier !== codeVerifier) {
      console.warn(`Warning: Stored code verifier doesn't match generated verifier`);
    } else {
      console.log('Code verifier successfully stored in secure storage');
    }
    
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
    const verifier = await storage.getItem(SECURITY_KEYS.CODE_VERIFIER);
    
    if (verifier) {
      console.log(`Retrieved stored code verifier: ${verifier}`);
    } else {
      console.error('No code verifier found in storage');
    }
    
    return verifier;
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
