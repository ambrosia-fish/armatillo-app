import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { handleOAuthCallback } = useAuth();
  const token = params.token as string;
  const code = params.code as string;
  const state = params.state as string;

  useEffect(() => {
    // Process the OAuth callback
    const processCallback = async () => {
      try {
        console.log('Processing auth callback with params:', { token, code, state });
        
        // Create full URL to pass to auth context
        let callbackUrl = 'callback?';
        if (token) {
          callbackUrl += `token=${token}`;
          if (state) callbackUrl += `&state=${state}`;
        } else if (code) {
          callbackUrl += `code=${code}`;
          if (state) callbackUrl += `&state=${state}`;
        } else {
          // If no token or code, something went wrong
          console.error('No token or code found in callback URL');
          router.replace('/login');
          return;
        }
        
        // Handle the callback through auth context
        await handleOAuthCallback(callbackUrl);
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error processing callback:', error);
        router.replace('/login');
      }
    };

    processCallback();
  }, [token, code, state, handleOAuthCallback, router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#2a9d8f" />
        <Text style={styles.text}>Completing sign in...</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginTop: 20,
    color: '#666',
  },
});
