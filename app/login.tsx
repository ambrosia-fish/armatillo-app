import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import { STORAGE_KEYS } from './utils/storage';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Check for existing token on load
  useEffect(() => {
    const checkToken = async () => {
      try {
        // This will print out token storage state for debugging
        await api.debug.debugTokenStorage();
      } catch (error) {
        console.error('Error checking token storage:', error);
      }
    };

    checkToken();
  }, []);

  // If already authenticated, redirect to home
  if (isAuthenticated && !isLoading) {
    return <Redirect href="/(tabs)" />;
  }

  // Handle login with Google
  const handleGoogleLogin = async () => {
    try {
      setLoginAttempted(true);
      console.log('Starting Google login flow');
      
      // Clear any existing tokens first
      try {
        // Use AsyncStorage directly to clear tokens before login
        await AsyncStorage.removeItem(`${Platform.OS === 'web' ? 'secure_' : ''}${STORAGE_KEYS.TOKEN}`);
        await AsyncStorage.removeItem(`${Platform.OS === 'web' ? 'secure_' : ''}${STORAGE_KEYS.REFRESH_TOKEN}`);
        await AsyncStorage.removeItem(`${Platform.OS === 'web' ? 'secure_' : ''}${STORAGE_KEYS.TOKEN_EXPIRY}`);
        console.log('Cleared existing tokens before login');
      } catch (clearError) {
        console.error('Error clearing tokens:', clearError);
      }
      
      await login();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        'Could not complete the login process. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {/* Logo and app name */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.appName}>Armatillo</Text>
          <Text style={styles.tagline}>Track your BFRB habits</Text>
        </View>
        
        {/* Login options */}
        <View style={styles.loginOptions}>
          <Text style={styles.loginTitle}>Sign in to continue</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#2a9d8f" style={styles.loading} />
          ) : (
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={24} color="#fff" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>
              By signing in, you agree to our{' '}
              <Text style={styles.privacyLink} onPress={() => console.log('Show terms')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.privacyLink} onPress={() => console.log('Show privacy')}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2a9d8f',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  loginOptions: {
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#2a9d8f',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  privacyContainer: {
    marginTop: 24,
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  privacyLink: {
    color: '#2a9d8f',
    fontWeight: '500',
  },
  loading: {
    marginVertical: 20,
  },
});
