import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import webStorage from './webStorage';

// Key used to store the encryption key in SecureStore
const ENCRYPTION_KEY_STORE = 'app_encryption_key';

// Metadata added to encrypted values to verify decryption was successful
const ENCRYPTION_METADATA = 'ARMATILLO_ENCRYPTED_V1:';

// Get the appropriate secure storage implementation based on platform
const getSecureStorage = () => {
  return Platform.OS === 'web' ? webStorage : SecureStore;
};

/**
 * Generate a device-specific encryption key and securely store it
 * This uses device characteristics and a random seed to generate a consistent key
 * @returns {Promise<string>} The generated encryption key
 */
export const generateEncryptionKey = async (): Promise<string> => {
  try {
    // Check if we already have a stored key
    const secureStorage = getSecureStorage();
    const existingKey = await secureStorage.getItemAsync(ENCRYPTION_KEY_STORE);
    if (existingKey) {
      return existingKey;
    }
    
    // Generate a device-specific component for the key
    const deviceId = await getDeviceIdentifier();
    
    // Create a random salt
    const salt = Array.from(Crypto.getRandomBytes(16))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Combine device ID with salt and hash to create the key
    const combinedInput = `${deviceId}:${salt}`;
    const keyBuffer = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combinedInput
    );
    
    // Convert the hash to a base64 string to use as our key
    const keyArray = new Uint8Array(keyBuffer);
    const keyString = btoa(String.fromCharCode(...keyArray));
    
    // Store the key securely
    await secureStorage.setItemAsync(ENCRYPTION_KEY_STORE, keyString);
    
    return keyString;
  } catch (error) {
    console.error('Error generating encryption key:', error);
    // Fallback to a less secure but functional approach if the above fails
    const fallbackKey = 'ARMATILLO_FALLBACK_KEY_' + Date.now().toString();
    const secureStorage = getSecureStorage();
    await secureStorage.setItemAsync(ENCRYPTION_KEY_STORE, fallbackKey);
    return fallbackKey;
  }
};

/**
 * Get a device identifier for encryption purposes
 * This combines multiple device characteristics
 * Adapted for web platform compatibility
 * @returns {Promise<string>} Device identifier
 */
const getDeviceIdentifier = async (): Promise<string> => {
  try {
    const deviceInfo = [];
    
    if (Platform.OS === 'web') {
      // Web-specific device information
      deviceInfo.push(`type:web`);
      
      // Browser information
      if (typeof navigator !== 'undefined') {
        deviceInfo.push(`browser:${navigator.userAgent.substring(0, 50)}`);
        
        if (navigator.language) {
          deviceInfo.push(`lang:${navigator.language}`);
        }
        
        if (navigator.platform) {
          deviceInfo.push(`platform:${navigator.platform}`);
        }
      }
      
      // Screen information
      if (typeof window !== 'undefined' && window.screen) {
        deviceInfo.push(`screen:${window.screen.width}x${window.screen.height}`);
        
        if (window.screen.colorDepth) {
          deviceInfo.push(`depth:${window.screen.colorDepth}`);
        }
      }
      
      // Add timestamp as a semi-unique identifier
      deviceInfo.push(`time:${Math.floor(Date.now() / 86400000)}`); // Days since epoch
    } else {
      // Native device information
      // Get device type
      const deviceType = Device.deviceType || 'unknown';
      deviceInfo.push(`type:${deviceType}`);
      
      // Get device name if available
      try {
        const deviceName = await Device.getDeviceNameAsync() || 'unknown';
        deviceInfo.push(`name:${deviceName.substring(0, 10)}`); // Only use first 10 chars for privacy
      } catch (e) {
        deviceInfo.push('name:unavailable');
      }
      
      // Get OS info
      const osName = Platform.OS;
      const osVersion = Platform.Version.toString();
      deviceInfo.push(`os:${osName}-${osVersion}`);
      
      // Get total memory if available
      try {
        const memory = await Device.getTotalMemoryAsync();
        deviceInfo.push(`mem:${memory}`);
      } catch (e) {
        deviceInfo.push('mem:unavailable');
      }
    }
    
    // Combine all info and create a hash
    const deviceInfoString = deviceInfo.join('|');
    const deviceHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      deviceInfoString
    );
    
    return deviceHash;
  } catch (error) {
    console.error('Error getting device identifier:', error);
    // Fallback to a generic identifier with timestamp
    return 'device_' + Date.now().toString();
  }
};

/**
 * Encrypt a string value
 * @param {string} value - Value to encrypt
 * @returns {Promise<string>} Encrypted value with metadata
 */
export const encryptString = async (value: string): Promise<string> => {
  try {
    if (!value) return value;
    
    // Get the encryption key
    const key = await generateEncryptionKey();
    
    // Create an initialization vector (IV)
    const iv = Crypto.getRandomBytes(16);
    const ivString = Array.from(iv)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Encrypt the value using a simple XOR cipher with key rotation
    // Note: For a production app, consider using a more robust encryption library
    const encrypted = [];
    for (let i = 0; i < value.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const ivChar = iv[i % iv.length];
      const valueChar = value.charCodeAt(i);
      encrypted.push((valueChar ^ keyChar ^ ivChar).toString(16).padStart(2, '0'));
    }
    
    // Combine IV and encrypted data
    const result = `${ENCRYPTION_METADATA}${ivString}:${encrypted.join('')}`;
    return result;
  } catch (error) {
    console.error('Error encrypting string:', error);
    // If encryption fails, return the original value, but prepend an error marker
    // This ensures we don't silently fail and can detect issues
    return `ENCRYPTION_ERROR:${value}`;
  }
};

/**
 * Decrypt an encrypted string value
 * @param {string} encryptedValue - Encrypted value to decrypt
 * @returns {Promise<string>} Decrypted value
 */
export const decryptString = async (encryptedValue: string): Promise<string> => {
  try {
    // Check if the value is actually encrypted
    if (!encryptedValue || !encryptedValue.startsWith(ENCRYPTION_METADATA)) {
      return encryptedValue;
    }
    
    // Handle encryption error case
    if (encryptedValue.startsWith('ENCRYPTION_ERROR:')) {
      return encryptedValue.slice('ENCRYPTION_ERROR:'.length);
    }
    
    // Strip the metadata
    const encryptedData = encryptedValue.slice(ENCRYPTION_METADATA.length);
    
    // Split the IV and encrypted content
    const [ivString, encryptedContent] = encryptedData.split(':');
    
    // Convert IV from hex string back to bytes
    const iv = new Uint8Array(ivString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Get the encryption key
    const key = await generateEncryptionKey();
    
    // Decrypt using the same XOR cipher
    const decrypted = [];
    for (let i = 0; i < encryptedContent.length / 2; i++) {
      const encHex = encryptedContent.substr(i * 2, 2);
      const encChar = parseInt(encHex, 16);
      const keyChar = key.charCodeAt(i % key.length);
      const ivChar = iv[i % iv.length];
      decrypted.push(String.fromCharCode(encChar ^ keyChar ^ ivChar));
    }
    
    return decrypted.join('');
  } catch (error) {
    console.error('Error decrypting string:', error);
    // On decryption error, return the encrypted value
    // This is safer than returning nothing or throwing an error
    return encryptedValue;
  }
};

/**
 * Encrypt an object
 * @param {any} obj - Object to encrypt
 * @returns {Promise<string>} Encrypted string
 */
export const encryptObject = async (obj: any): Promise<string> => {
  try {
    const jsonString = JSON.stringify(obj);
    return await encryptString(jsonString);
  } catch (error) {
    console.error('Error encrypting object:', error);
    return JSON.stringify(obj);
  }
};

/**
 * Decrypt an object
 * @param {string} encryptedValue - Encrypted object string
 * @returns {Promise<any>} Decrypted object
 */
export const decryptObject = async (encryptedValue: string): Promise<any> => {
  try {
    const decryptedString = await decryptString(encryptedValue);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Error decrypting object:', error);
    // If we can't parse the JSON, return null
    return null;
  }
};

export default {
  encryptString,
  decryptString,
  encryptObject,
  decryptObject,
  generateEncryptionKey,
};
