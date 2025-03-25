/**
 * This file is deprecated since we've moved to username/password authentication.
 * Keeping an empty version for backward compatibility.
 */

export function generateCodeVerifier(): string {
  return '';
}

export function generateCodeChallenge(verifier: string): string {
  return '';
}

export async function storeCodeVerifier(verifier: string): Promise<void> {
  // No-op
}

export async function getCodeVerifier(): Promise<string | null> {
  return null;
}

export async function clearCodeVerifier(): Promise<void> {
  // No-op
}

export async function generatePKCEChallenge(): Promise<{ codeVerifier: string, codeChallenge: string }> {
  return { codeVerifier: '', codeChallenge: '' };
}

export default {
  generateCodeVerifier,
  generateCodeChallenge,
  storeCodeVerifier,
  getCodeVerifier,
  clearCodeVerifier,
  generatePKCEChallenge
};
