import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
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
  const router = useRouter();
  const { isAuthenticated, isLoading, isPendingApproval } = useAuth();

  /**
   * Log authentication status on mount and when it changes
   * Provides helpful debugging information
   */
  useEffect(() => {
    try {
      if (!isLoading) {
        // Log authentication status but only after loading is complete
        if (isAuthenticated) {
          console.log('AuthGuard: User is authenticated');
        } else if (isPendingApproval) {
          console.log('AuthGuard: User account is pending approval, redirecting to approval modal');
          router.push('/screens/modals/approval-pending-modal');
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
  }, [isAuthenticated, isLoading, isPendingApproval]);

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <View 
        style={styles.container}
        accessibilityLabel="Loading authentication status"
        accessibilityRole="progressbar"
      >
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // If pending approval, redirect to the approval modal
  if (isPendingApproval) {
    try {
      return <Redirect href="/screens/modals/approval-pending-modal" />;
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        source: 'auth',
        level: 'error',
        displayToUser: false,
        context: { component: 'AuthGuard', action: 'redirect' }
      });
      // Fallback to a more basic redirect if the first attempt fails
      router.push('/screens/modals/approval-pending-modal');
      return (
        <View 
          style={styles.container}
          accessibilityLabel="Account approval required"
          accessibilityRole="alert"
        >
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.text}>Redirecting...</Text>
        </View>
      );
    }
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
        <View 
          style={styles.container}
          accessibilityLabel="Authentication required"
          accessibilityRole="alert"
        >
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
  } as ViewStyle,
  text: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  } as TextStyle,
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.utility.error,
    marginBottom: theme.spacing.md,
  } as TextStyle,
});