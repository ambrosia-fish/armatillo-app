import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';
import theme from '@/app/constants/theme';

/**
 * RouteGuard component to protect routes requiring authentication
 * This component should be used at the top level of protected routes
 */
export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, authState } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // Define routes that don't require authentication
  const publicRoutes = [
    'screens', 'auth', 'login', // Login screen
    '+not-found', // Not found page
  ];
  
  // Check if current route is public
  const isPublicRoute = segments.some(segment => publicRoutes.includes(segment));
  
  // Log for debugging
  useEffect(() => {
    console.log('RouteGuard: Current segments:', segments);
    console.log('RouteGuard: Is public route:', isPublicRoute);
    console.log('RouteGuard: Auth state:', authState);
  }, [segments, isPublicRoute, authState]);
  
  // Handle navigation and protection
  useEffect(() => {
    if (isLoading) {
      return; // Don't navigate while loading
    }
    
    // If the route requires authentication and user is not authenticated, redirect to login
    if (!isPublicRoute && !isAuthenticated) {
      console.log('RouteGuard: Redirecting to login screen');
      // Use a small delay to avoid navigation race conditions
      const timer = setTimeout(() => {
        router.replace('/screens/auth/login');
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // If user is authenticated and on login screen, redirect to home
    if (isAuthenticated && segments.includes('login')) {
      console.log('RouteGuard: Redirecting to home screen');
      // Use a small delay to avoid navigation race conditions
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, segments, isPublicRoute, router]);
  
  // Show loading screen while authentication state is being determined
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Loading authentication state...</Text>
      </View>
    );
  }
  
  // If on a protected route without authentication, show loading screen while redirecting
  if (!isPublicRoute && !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Please wait...</Text>
        <Text style={styles.subText}>Redirecting to login...</Text>
      </View>
    );
  }
  
  // Otherwise, render the children
  return <>{children}</>;
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