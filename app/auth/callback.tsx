import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * This is a placeholder for OAuth callback.
 * Since we've switched to username/password authentication,
 * this just redirects to the login screen.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();

  // Redirect to login page immediately
  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#2a9d8f" />
        <Text style={styles.text}>Redirecting...</Text>
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
