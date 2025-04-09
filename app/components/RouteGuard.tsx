import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
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
  
  // Add state to track navigation actions to prevent duplicates
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Use ref to track previous segments to prevent redundant navigation
  const prevSegmentsRef = useRef<string[]>([]);
  const navigationAttemptRef = useRef(0);
  
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
    console.log('RouteGuard: Is navigating:', isNavigating);
  }, [segments, isPublicRoute, authState, isNavigating]);
  
  // Reset navigation attempt counter when segments change
  useEffect(() => {
    const segmentsString = segments.join('/');
    const prevSegmentsString = prevSegmentsRef.current.join('/');
    
    if (segmentsString !== prevSegmentsString) {
      console.log('RouteGuard: Segments changed from', prevSegmentsString, 'to', segmentsString);
      navigationAttemptRef.current = 0;
      prevSegmentsRef.current = segments;
    }
  }, [segments]);
  
  // Handle navigation and protection
  useEffect(() => {
    // Don't do anything if already navigating to prevent race conditions
    if (isNavigating) {
      return;
    }
    
    // Don't navigate while loading auth state
    if (isLoading) {
      return;
    }
    
    // If on a protected route without authentication, redirect to login
    if (!isPublicRoute && !isAuthenticated) {
      // Prevent excessive navigation attempts
      if (navigationAttemptRef.current >= 2) {
        console.log('RouteGuard: Too many navigation attempts, aborting');
        return;
      }
      
      console.log('RouteGuard: Redirecting to login screen');
      navigationAttemptRef.current += 1;
      
      // Set navigating state to prevent duplicate navigation
      setIsNavigating(true);
      
      // Use different navigation approaches based on platform
      if (Platform.OS === 'web') {
        window.location.href = '/screens/auth/login';
      } else {
        // Use a small delay to avoid navigation race conditions
        const timer = setTimeout(() => {
          try {
            router.replace('/screens/auth/login');
          } catch (e) {
            console.error('RouteGuard navigation error:', e);
          }
          
          // Reset navigating state after a delay
          setTimeout(() => {
            setIsNavigating(false);
          }, 500);
        }, 300);
        
        return () => {
          clearTimeout(timer);
          setIsNavigating(false);
        };
      }
    }
    
    // If authenticated but on login screen, redirect to home
    if (isAuthenticated && segments.includes('login')) {
      // Prevent excessive navigation attempts
      if (navigationAttemptRef.current >= 2) {
        console.log('RouteGuard: Too many navigation attempts, aborting');
        return;
      }
      
      console.log('RouteGuard: Redirecting to home screen');
      navigationAttemptRef.current += 1;
      
      // Set navigating state to prevent duplicate navigation
      setIsNavigating(true);
      
      // Use different navigation approaches based on platform
      if (Platform.OS === 'web') {
        window.location.href = '/(tabs)';
      } else {
        // Use a small delay to avoid navigation race conditions
        const timer = setTimeout(() => {
          try {
            router.replace('/(tabs)');
          } catch (e) {
            console.error('RouteGuard navigation error:', e);
          }
          
          // Reset navigating state after a delay
          setTimeout(() => {
            setIsNavigating(false);
          }, 500);
        }, 300);
        
        return () => {
          clearTimeout(timer);
          setIsNavigating(false);
        };
      }
    }
  }, [isAuthenticated, isLoading, segments, isPublicRoute, router, isNavigating]);
  
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
  if (!isPublicRoute && !isAuthenticated && isNavigating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Please wait...</Text>
        <Text style={styles.subText}>Redirecting to login...</Text>
      </View>
    );
  }
  
  // If authenticated and on login page, show loading while redirecting
  if (isAuthenticated && segments.includes('login') && isNavigating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Please wait...</Text>
        <Text style={styles.subText}>Redirecting to home...</Text>
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