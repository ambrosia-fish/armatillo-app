import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';
import config from '../constants/config';
import { errorService } from '../services/ErrorService';

export const DEFAULT_TOKEN_EXPIRATION = config.authConfig.tokenExpiration;

export async function storeAuthTokens(
  token: string,
  expiresIn: number = DEFAULT_TOKEN_EXPIRATION / 1000,
  refreshToken?: string
): Promise<void> {
  try {
    const expiryTime = Date.now() + expiresIn * 1000;
    const expiryTimeString = expiryTime.toString();

    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimeString);

    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      context: { action: 'storeAuthTokens' }
    });
    throw error;
  }
}

export async function isTokenExpired(
  bufferMs: number = config.authConfig.tokenRefreshBuffer
): Promise<boolean> {
  try {
    const expiryTimeString = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    
    if (!expiryTimeString) {
      return true;
    }

    const expiryTime = parseInt(expiryTimeString, 10);
    const currentTime = Date.now();
    
    return currentTime + bufferMs >= expiryTime;
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      displayToUser: false,
      context: { action: 'isTokenExpired' }
    });
    return true;
  }
}

export async function clearAuthTokens(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      context: { action: 'clearAuthTokens' }
    });
    throw error;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'storage',
      displayToUser: false,
      context: { action: 'getRefreshToken' }
    });
    return null;
  }
}

export default {
  storeAuthTokens,
  isTokenExpired,
  clearAuthTokens,
  getRefreshToken,
  DEFAULT_TOKEN_EXPIRATION
};