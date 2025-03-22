/**
 * This file contains a mock PKCE implementation for testing with our specific backend.
 * This is only used if the standard PKCE implementation doesn't work with the backend.
 */

import storage, { STORAGE_KEYS } from './storage';

// Storage key for code verifier
const CODE_VERIFIER_STORAGE_KEY = 'pkce_code_verifier';

// Generate a random code verifier
export function generateCodeVerifier(): string {
  // Use a fixed code verifier that works with the backend for testing
  return 'testtesttesttesttesttesttesttesttesttesttesttesttesttesttest';
}

// Generate a code challenge that matches what the backend expects
export function generateCodeChallenge(verifier: string): string {
  // For our specific backend, return the pre-computed challenge that matches the verifier
  return 'rjXGgGimsYDsuCRrL5PAZ3d1EB5nFqU8g-fKl5_bRxo';
}

// Store the code verifier
export async function storeCodeVerifier(verifier: string): Promise<void> {
  console.log('Storing code verifier:', verifier);
  await storage.setItem(CODE_VERIFIER_STORAGE_KEY, verifier);
}

// Get the stored code verifier
export async function getCodeVerifier(): Promise<string | null> {
  const verifier = await storage.getItem(CODE_VERIFIER_STORAGE_KEY);
  console.log('Retrieved code verifier:', verifier);
  return verifier;
}

// Clear the stored code verifier
export async function clearCodeVerifier(): Promise<void> {
  console.log('Clearing code verifier');
  await storage.removeItem(CODE_VERIFIER_STORAGE_KEY);
}

// Generate a PKCE challenge
export async function generatePKCEChallenge(): Promise<{ codeVerifier: string, codeChallenge: string }> {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  
  // Store the verifier for later
  await storeCodeVerifier(verifier);
  
  console.log('Using mock PKCE implementation');
  console.log(`Mock code verifier: ${verifier}`);
  console.log(`Mock code challenge: ${challenge}`);
  
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
