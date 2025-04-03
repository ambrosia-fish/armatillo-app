import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component to protect routes requiring authentication
 * Redirects to login if user is not authenticated
 * 
 * @param {React.ReactNode} children - The components to render when authenticated
 * @returns {React.ReactElement} - The protected component or redirect
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Log authentication status on mount and when it changes
  useEffect(() => {
    try {
      if (!isLoading) {
        // Log authentication status but only after loading is complete
        if (isAuthenticated) {
          console.log('AuthGuard: User is authenticated');
        } else {
          console.log('AuthGuard: User is not authenticated, redirecting to login');
        }
      }
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        source: 'auth',
        level: 'warning',
        displayToUser: false,
        context: { component: 'AuthGuard', action: 'checkAuth' }
      });
    }
  }, [isAuthenticated, isLoading]);

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    try {
      return <Redirect href="/screens/auth/login" />;
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        source: 'auth',
        level: 'error',
        displayToUser: false,
        context: { component: 'AuthGuard', action: 'redirect' }
      });
      // Fallback to a more basic redirect if the first attempt fails
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Authentication required</Text>
          <Text style={styles.text}>Redirecting to login...</Text>
        </View>
      );
    }
  }

  // If authenticated, render the children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  text: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.utility.error,
    marginBottom: theme.spacing.md,
  },
});