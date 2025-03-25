/**
 * This file is deprecated since we've moved to username/password authentication.
 * Keeping an empty version for backward compatibility.
 */

// WebBrowser presentation styles
export enum WebBrowserPresentationStyle {
  FULL_SCREEN = 0,
  CURRENT_CONTEXT = 1,
  PAGE_SHEET = 2,
  FORM_SHEET = 3,
  AUTOMATIC = 4,
  OVER_FULL_SCREEN = 5
}

// No-op implementations
export const warmUpAsync = async (): Promise<void> => {};
export const coolDownAsync = async (): Promise<void> => {};
export const openAuthSessionAsync = async (
  url: string,
  redirectUrl: string,
): Promise<{ type: 'success' | 'cancel', url?: string }> => {
  return { type: 'cancel' };
};

export default {
  warmUpAsync,
  coolDownAsync,
  openAuthSessionAsync,
  WebBrowserPresentationStyle
};
