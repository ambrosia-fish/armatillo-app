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

  useEffect(() => {
    const processCallback = async () => {
      try {
        if (token) {
          await handleOAuthCallback(`callback?token=${token}`);
          router.replace('/(tabs)');
        } else {
          console.error('No token found in callback URL');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error processing callback:', error);
        router.replace('/login');
      }
    };

    processCallback();
  }, [token, handleOAuthCallback, router]);

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
