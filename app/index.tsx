import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/app/store/contexts/';
import theme from './styles/theme';

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
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // Redirect based on authentication state
  return isAuthenticated ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/screens/auth/login" />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  text: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  } as TextStyle,
});