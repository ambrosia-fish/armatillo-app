import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { router } from 'expo-router';
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
  const { isAuthenticated, isLoading, isPendingApproval, authState } = useAuth();

  /**
   * Handle authentication state changes
   * This effect runs on mount and whenever auth state changes
   */
  useEffect(() => {
    // Skip navigation during the loading phase
    if (isLoading) return;
    
    try {
      // Log authentication status for debugging
      console.log('AuthGuard: Auth state:', authState);
      
      if (!isAuthenticated) {
        // Use a small timeout to prevent navigation race conditions
        const timer = setTimeout(() => {
          try {
            if (isPendingApproval) {
              console.log('AuthGuard: User account is pending approval, redirecting...');
              router.replace('/screens/modals/approval-pending-modal');
            } else {
              console.log('AuthGuard: User is not authenticated, redirecting to login...');
              router.replace('/screens/auth/login');
            }
          } catch (navError) {
            errorService.handleError(navError instanceof Error ? navError : String(navError), {
              source: 'navigation',
              level: 'warning',
              displayToUser: false,
              context: { component: 'AuthGuard', action: 'redirect' }
            });
          }
        }, 100);
        
        // Cleanup timer if component unmounts
        return () => clearTimeout(timer);
      }
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        source: 'auth',
        level: 'warning',
        displayToUser: false,
        context: { component: 'AuthGuard', action: 'checkAuth' }
      });
    }
  }, [isAuthenticated, isLoading, isPendingApproval, authState]);

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

  // If pending approval, show a message and redirect
  if (isPendingApproval) {
    return (
      <View 
        style={styles.container}
        accessibilityLabel="Account approval required"
        accessibilityRole="alert"
      >
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.text}>Your account is pending approval.</Text>
        <Text style={styles.subText}>Redirecting to approval screen...</Text>
      </View>
    );
  }

  // If not authenticated, show a message and redirect
  if (!isAuthenticated) {
    return (
      <View 
        style={styles.container}
        accessibilityLabel="Authentication required"
        accessibilityRole="alert"
      >
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.text}>Authentication required.</Text>
        <Text style={styles.subText}>Redirecting to login...</Text>
      </View>
    );
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
    padding: theme.spacing.lg,
  } as ViewStyle,
  
  text: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    textAlign: 'center',
  } as TextStyle,
  
  subText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.utility.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  } as TextStyle,
});
