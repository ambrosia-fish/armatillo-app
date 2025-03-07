import storage, { STORAGE_KEYS } from './storage';

// Add new storage keys for security parameters
export const SECURITY_KEYS = {
  OAUTH_STATE: 'oauth_state',
  CODE_VERIFIER: 'pkce_code_verifier',
};

/**
 * Generate a random string of specified length for security purposes
 * Used for generating OAuth state and PKCE code verifier
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  
  // Use crypto.getRandomValues if available (browser)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    // Fallback to Math.random (less secure)
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
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
 * Generate PKCE code verifier and code challenge
 * For advanced OAuth security
 * @returns Object containing code verifier and code challenge
 */
export async function generatePKCEChallenge(): Promise<{ codeVerifier: string, codeChallenge: string }> {
  // This function is a placeholder for future PKCE implementation
  // For now, we're just implementing the OAuth state parameter
  // Full PKCE implementation would require crypto functions
  
  const codeVerifier = generateRandomString(64);
  // In a real implementation, we'd hash the verifier using SHA-256 to create the challenge
  // For now, we'll just use the same value for simplicity
  const codeChallenge = codeVerifier;
  
  await storage.setItem(SECURITY_KEYS.CODE_VERIFIER, codeVerifier);
  
  return { codeVerifier, codeChallenge };
}

// Default export for compatibility with routes
export default {
  generateRandomString,
  generateOAuthState,
  verifyOAuthState,
  generatePKCEChallenge,
  SECURITY_KEYS
};
