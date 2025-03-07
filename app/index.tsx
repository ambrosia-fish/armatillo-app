import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from './context/AuthContext';

/**
 * Root index route - handles redirection based on auth state
 * Redirects to tabs if authenticated, login if not
 */
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2a9d8f" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // Redirect based on authentication state
  return isAuthenticated ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/login" />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
