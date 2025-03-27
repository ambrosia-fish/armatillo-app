/**
 * Armatillo Configuration
 * 
 * Centralized configuration for the app.
 * Environment-specific settings and app-wide configuration values belong here.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

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
 * Gets the base API URL based on environment and platform
 */
export const getApiUrl = (): string => {
  const environment = getEnvironment();
  
  // For development, determine URL based on platform
  if (environment === 'development') {
    // For physical devices using Expo Go, the developer would need to set their local IP here
    // or preferably via app.config.js or environment variables
    const localIp = Constants.expoConfig?.extra?.localIp || '192.168.0.101';
    
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
    // Web development
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
export const getConfig = (): ApiConfig => {
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
    config.apiUrl = getApiUrl();
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

// Default export with all config options
const config = {
  getEnvironment,
  getApiUrl,
  getConfig,
  authConfig,
  crashRecoveryConfig,
  appInfo,
  // Main config will be based on current environment
  ...getConfig(),
};

export default config;
