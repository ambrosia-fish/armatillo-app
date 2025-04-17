/**
 * Armatillo Configuration
 * 
 * Centralized configuration for the app.
 * Environment-specific settings and app-wide configuration values belong here.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import NetInfo from '@react-native-community/netinfo';

// Configuration for different environments
interface ApiConfig {
  apiUrl: string;
  apiBasePath: string;
  useSecureStorage: boolean;
  enableLogging: boolean;
}

// Default development configuration
const devConfig: ApiConfig = {
  apiUrl: '',  // Will be determined based on platform
  apiBasePath: '/api',
  useSecureStorage: true,
  enableLogging: true,
};

// Production configuration
const prodConfig: ApiConfig = {
  apiUrl: 'https://armatillo-api-production.up.railway.app',
  apiBasePath: '/api',
  useSecureStorage: true,
  enableLogging: false,
};

// Staging configuration
const stagingConfig: ApiConfig = {
  apiUrl: 'https://armatillo-api-staging.up.railway.app',
  apiBasePath: '/api',
  useSecureStorage: true,
  enableLogging: true,
};

/**
 * Determines the current environment based on app configuration or environment variables
 */
export const getEnvironment = (): 'development' | 'staging' | 'production' => {
  // Check for environment variable or manifest extra to override environment
  const envOverride = Constants.expoConfig?.extra?.environment;
  if (envOverride) {
    if (['development', 'staging', 'production'].includes(envOverride)) {
      return envOverride as 'development' | 'staging' | 'production';
    }
  }
  
  // Default to development in __DEV__ mode, production otherwise
  return __DEV__ ? 'development' : 'production';
};

/**
 * Gets the device's local IP address
 * Falls back to provided IP or default value if detection fails
 */
export const getLocalIpAddress = async (): Promise<string> => {
  try {
    const state = await NetInfo.fetch();
    
    // On iOS and Android, we can get the IP address from the NetInfo details
    if (state.type === 'wifi' && state.details && 'ipAddress' in state.details) {
      return state.details.ipAddress;
    }
    
    // If we couldn't get the IP from NetInfo, fall back to configured value
    return Constants.expoConfig?.extra?.localIp || '192.168.1.29';
  } catch (error) {
    console.warn('Failed to get IP address:', error);
    return Constants.expoConfig?.extra?.localIp || '192.168.1.29';
  }
};

/**
 * Gets the base API URL based on environment and platform
 */
export const getApiUrl = async (): Promise<string> => {
  const environment = getEnvironment();
  
  // If we're running on web, check the current hostname to determine API URL
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Development domain
    if (hostname === 'dev.armatillo.com') {
      return 'https://armatillo-api-development.up.railway.app';
    }
    
    // Production domain
    if (hostname === 'app.armatillo.com') {
      return 'https://armatillo-api-production.up.railway.app';
    }
    
    // Staging domain - add if needed
    if (hostname === 'staging.armatillo.com') {
      return 'https://armatillo-api-staging.up.railway.app';
    }
    
    // Vercel preview deployments or local development
    if (hostname.includes('vercel.app') || hostname === 'localhost') {
      return 'https://armatillo-api-development.up.railway.app';
    }
  }
  
  // For development, determine URL based on platform
  if (environment === 'development') {
    // Dynamically get the local IP address
    const localIp = await getLocalIpAddress();
    
    if (Constants.appOwnership === 'expo') {
      return `http://${localIp}:3000`;
    }
    
    // iOS simulator can use localhost
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000';
    } 
    // Android emulator uses 10.0.2.2 to access host's localhost
    else if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    // Web development - only if we didn't catch hostname above
    else if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    }
    
    // Fallback to cloud development API
    return 'https://armatillo-api-development.up.railway.app';
  }
  
  // For staging
  if (environment === 'staging') {
    return stagingConfig.apiUrl;
  }
  
  // For production
  return prodConfig.apiUrl;
};

/**
 * Get the appropriate configuration for the current environment
 */
export const getConfig = async (): Promise<ApiConfig> => {
  const environment = getEnvironment();
  
  // Choose the base config based on environment
  let config: ApiConfig;
  switch (environment) {
    case 'production':
      config = { ...prodConfig };
      break;
    case 'staging':
      config = { ...stagingConfig };
      break;
    case 'development':
    default:
      config = { ...devConfig };
      break;
  }
  
  // Set the API URL if it's not already set
  if (!config.apiUrl) {
    config.apiUrl = await getApiUrl();
  }
  
  return config;
};

/**
 * Get synchronized config (non-async version for initial loading)
 * This uses defaults without waiting for IP detection
 */
export const getSyncConfig = (): ApiConfig => {
  const environment = getEnvironment();
  
  // Choose the base config based on environment
  let config: ApiConfig;
  switch (environment) {
    case 'production':
      config = { ...prodConfig };
      break;
    case 'staging':
      config = { ...stagingConfig };
      break;
    case 'development':
    default:
      config = { ...devConfig };
      break;
  }
  
  // Set a default API URL if it's not already set
  if (!config.apiUrl) {
    // For development, use default values
    if (environment === 'development') {
      const defaultIp = Constants.expoConfig?.extra?.localIp || '192.168.1.29';
      
      if (Constants.appOwnership === 'expo') {
        config.apiUrl = `http://${defaultIp}:3000`;
      } else if (Platform.OS === 'ios') {
        config.apiUrl = 'http://localhost:3000';
      } else if (Platform.OS === 'android') {
        config.apiUrl = 'http://10.0.2.2:3000';
      } else if (Platform.OS === 'web') {
        config.apiUrl = 'http://localhost:3000';
      } else {
        config.apiUrl = 'https://armatillo-api-development.up.railway.app';
      }
    } else if (environment === 'staging') {
      config.apiUrl = stagingConfig.apiUrl;
    } else {
      config.apiUrl = prodConfig.apiUrl;
    }
  }
  
  return config;
};

/**
 * Auth Configuration
 */
export const authConfig = {
  // Token expiration time in milliseconds (1 hour)
  tokenExpiration: 60 * 60 * 1000,
  // Token refresh buffer time in milliseconds (5 minutes)
  tokenRefreshBuffer: 5 * 60 * 1000,
  // OAuth configuration
  oauth: {
    redirectUri: 'armatillo://auth/callback',
    googleAuthUrl: '/api/auth/google-mobile',
  }
};

/**
 * Crash Recovery Configuration
 */
export const crashRecoveryConfig = {
  // Maximum age of recovery data to consider valid (10 minutes)
  maxRecoveryAge: 10 * 60 * 1000,
  // Minimum interval between state saves
  minStateSaveInterval: 5000,
};

/**
 * App Information
 */
export const appInfo = {
  name: 'Armatillo',
  version: Constants.expoConfig?.version || '1.0.0',
  buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1',
  isDevice: Device.isDevice,
  deviceType: Device.deviceType,
  osVersion: Device.osVersion,
  // Add other app metadata as needed
};

// Initialize with sync config and update async
let currentConfig = getSyncConfig();

// Update config asynchronously - this runs when the module is imported
getConfig().then(asyncConfig => {
  currentConfig = { ...currentConfig, ...asyncConfig };
}).catch(error => {
  console.warn('Failed to get async config:', error);
});

// Default export with all config options
const config = {
  getEnvironment,
  getLocalIpAddress,
  getApiUrl,
  getConfig,
  getSyncConfig,
  authConfig,
  crashRecoveryConfig,
  appInfo,
  // Main config will be based on current environment
  ...currentConfig,
};

export default config;