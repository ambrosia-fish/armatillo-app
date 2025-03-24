import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import storage, { STORAGE_KEYS } from '../utils/storage';
import { storeAuthTokens, isTokenExpired, getTokenTimeRemaining } from '../utils/tokenUtils';
import { generateOAuthState, verifyOAuthState, generatePKCEChallenge, getStoredCodeVerifier, clearCodeVerifier } from '../utils/securityUtils';
import { API_URL, testApiConnection } from './api';

/**
 * Service for handling authentication-related operations
 */

// Flag to bypass regular OAuth in development mode
const BYPASS_AUTH_IN_DEV = false;

/**
 * Get the correct API URL for OAuth requests
 * This ensures we use the same URL that the API service does
 */
const getOAuthUrl = () => {
  // Use the same API_URL that the api service uses
  return API_URL;
};

/**
 * Initiate the OAuth flow
 */
export const initiateOAuthFlow = async (setIsLoading: (value: boolean) => void, setInProgress: (value: boolean) => void) => {
  try {
    // First test the API connection before proceeding
    const isConnected = await testApiConnection();
    if (!isConnected) {
      Alert.alert(
        'Connection Failed',
        'Cannot connect to the server. Please check your network or server status.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsLoading(true);
    setInProgress(true);
    
    // Clear previous auth state
    await clearAuthState();
    
    try {
      await WebBrowser.warmUpAsync();
    } catch (e) {
      // Ignore errors from warmup - it's just an optimization
    }
    
    // Generate OAuth state and PKCE challenge
    const state = await generateOAuthState();
    
    // Generate PKCE challenge with extra debug to fix the empty code_challenge
    const pkceResult = await generatePKCEChallenge();
    console.log('PKCE verifier (first 10 chars):', pkceResult.codeVerifier.substring(0, 10));
    console.log('PKCE challenge:', pkceResult.codeChallenge);
    
    if (!pkceResult.codeChallenge) {
      console.warn('⚠️ Empty code challenge generated! Using fallback.');
      // Use a fallback challenge if generation failed
      pkceResult.codeChallenge = 'rjXGgGimsYDsuCRrL5PAZ3d1EB5nFqU8g-fKl5_bRxo';
    }
    
    // Create auth URL
    const timestamp = Date.now();
    const randomNonce = Math.random().toString(36).substring(2);
    
    // Create redirect URI for the app - this will be stored on server but 
    // not sent to Google (Google will use a server URL)
    // We'll detect the platform and create an appropriate URL
    let redirectUri;
    
    if (Platform.OS === 'web') {
      // For web, use web URL
      redirectUri = `${window.location.origin}/auth/callback`;
    } else if (Constants.appOwnership === 'expo') {
      // For Expo Go
      // Get the host part of the manifest
      const { manifest } = Constants;
      let expoHost;
      
      if (manifest && manifest.hostUri) {
        // Extract host from manifest
        expoHost = manifest.hostUri.split(':')[0];
        redirectUri = `exp://${expoHost}:8081/auth/callback`;
      } else if (manifest && manifest.debuggerHost) {
        // Try debugger host instead
        expoHost = manifest.debuggerHost.split(':')[0];
        redirectUri = `exp://${expoHost}:8081/auth/callback`;
      } else {
        // Hardcoded fallback - works if app is served from local dev
        redirectUri = `exp://192.168.0.101:8081/auth/callback`;
      }
    } else {
      // For standalone apps, use custom scheme
      redirectUri = 'armatillo://auth/callback';
    }
    
    console.log('Using Redirect URI for app:', redirectUri);
    
    // Get the OAuth server URL (using the API URL from api.ts)
    const apiUrl = getOAuthUrl();
    console.log('Using OAuth API URL:', apiUrl);
    
    const authUrl = `${apiUrl}/api/auth/google-mobile?` + 
      `state=${encodeURIComponent(state)}` +
      `&code_challenge=${encodeURIComponent(pkceResult.codeChallenge)}` +
      `&code_challenge_method=S256` +
      `&force_login=true` +
      `&prompt=select_account` +
      `&nonce=${randomNonce}` +
      `&timestamp=${timestamp}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&use_incognito=true`;
    
    console.log('Opening auth URL:', authUrl);
    
    // For Web platform, handle differently
    if (Platform.OS === 'web') {
      await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );
    } else {
      // For native platforms, try to use the native WebBrowser
      try {
        // Use system browser for better compatibility
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri,
          {
            createTask: true,
            showInRecents: false,
            dismissButtonStyle: 'close',
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            preferEphemeralSession: true
          }
        );
        
        console.log('WebBrowser result:', result);
        
        if (result.type !== 'success' || !result.url) {
          // User cancelled or flow was interrupted
          console.log('WebBrowser did not complete successfully');
          setIsLoading(false);
          setInProgress(false);
        }
      } catch (error) {
        console.error('WebBrowser error:', error);
        
        // Fallback option removed to avoid Linking import
        Alert.alert('Authentication Error', 'Unable to open authentication browser.');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    setIsLoading(false);
    setInProgress(false);
    Alert.alert('Login Failed', 'Failed to authenticate. Please try again.');
  } finally {
    try {
      await WebBrowser.coolDownAsync();
    } catch (error) {
      // Ignore errors from cooldown
    }
  }
};

// Rest of the file remains the same...
