import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Slot, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { StyleSheet } from 'react-native';

import { useColorScheme } from './hooks/useColorScheme';
import { FormProvider } from './context/FormContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import theme from './constants/theme';
import { errorService } from './services/ErrorService';

export { ErrorBoundary };

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * Protected layout for authenticated routes
 * Protects all routes except explicitly public ones
 */
function ProtectedLayout() {
  const { isAuthenticated, isLoading, authState } = useAuth();
  const segments = useSegments();
  
  // Non-protected routes - these don't require authentication
  const publicRoutes = [
    'screens/auth/login',
    '+not-found'
    // Note: '/' or 'index' is NOT in this list, so it's protected
  ];
  
  // Determine if current route needs protection
  const isPublicRoute = segments.length > 0 && publicRoutes.some(route => segments.includes(route));
  const needsAuth = !isPublicRoute;

  // Log route information for debugging
  useEffect(() => {
    console.log(`ProtectedLayout: Segments ${segments.join('/')}, needsAuth: ${needsAuth}, authState: ${authState}`);
  }, [segments, needsAuth, authState]);

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  // Instead of using imperative navigation, use declarative Redirect
  if (needsAuth && !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Please wait...</Text>
        <Text style={styles.subText}>Redirecting to login...</Text>
        <Redirect href="/screens/auth/login" />
      </View>
    );
  }
  
  // If authenticated but on login screen, redirect to home
  if (isAuthenticated && segments.includes('login')) {
    return <Redirect href="/(tabs)" />;
  }
  
  // Otherwise render slot for children
  return <Slot />;
}

/**
 * Root layout component
 */
export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

/**
 * Root navigation layout
 */
function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <FormProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ProtectedLayout />
        </ThemeProvider>
      </FormProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});