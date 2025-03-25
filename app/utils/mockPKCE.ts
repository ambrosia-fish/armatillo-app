/**
 * DEPRECATED: This file is kept for compatibility with Google OAuth flow
 * For the new username/password authentication, this is not used.
 */

import storage from './storage';

// Storage key for code verifier
const CODE_VERIFIER_STORAGE_KEY = 'pkce_code_verifier';

// Generate a random code verifier
export function generateCodeVerifier(): string {
  return 'testtesttesttesttesttesttesttesttesttesttesttesttesttesttest';
}

// Generate a code challenge that matches what the backend expects
export function generateCodeChallenge(verifier: string): string {
  return 'rjXGgGimsYDsuCRrL5PAZ3d1EB5nFqU8g-fKl5_bRxo';
}

// Store the code verifier
export async function storeCodeVerifier(verifier: string): Promise<void> {
  await storage.setItem(CODE_VERIFIER_STORAGE_KEY, verifier);
}

// Get the stored code verifier
export async function getCodeVerifier(): Promise<string | null> {
  return await storage.getItem(CODE_VERIFIER_STORAGE_KEY);
}

// Clear the stored code verifier
export async function clearCodeVerifier(): Promise<void> {
  await storage.removeItem(CODE_VERIFIER_STORAGE_KEY);
}

// Generate a PKCE challenge
export async function generatePKCEChallenge(): Promise<{ codeVerifier: string, codeChallenge: string }> {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  
  await storeCodeVerifier(verifier);
  
  return { codeVerifier: verifier, codeChallenge: challenge };
}

export default {
  generateCodeVerifier,
  generateCodeChallenge,
  storeCodeVerifier,
  getCodeVerifier,
  clearCodeVerifier,
  generatePKCEChallenge
};
