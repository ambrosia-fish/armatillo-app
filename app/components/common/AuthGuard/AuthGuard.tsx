import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/store/contexts/AuthContext';
import theme from '@/app/styles/theme';
import { errorService } from '@/app/services/error/ErrorService';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component to protect routes requiring authentication
 * Shows loading states and redirects to login if not authenticated
 * 
 * @param {React.ReactNode} children - The components to render when authenticated
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isPendingApproval, authState } = useAuth();
  const router = useRouter();

  /**
   * Log authentication status for debugging
   */
  useEffect(() => {
    console.log('AuthGuard: Auth state:', authState, 'isAuthenticated:', isAuthenticated);
  }, [authState, isAuthenticated]);

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

  // If pending approval, show a message
  if (isPendingApproval) {
    return (
      <View 
        style={styles.container}
        accessibilityLabel="Account approval required"
        accessibilityRole="alert"
      >
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.text}>Your account is pending approval.</Text>
        <Text style={styles.subText}>Please wait for admin approval.</Text>
      </View>
    );
  }

  // If not authenticated, show message
  // Navigation will be handled by ProtectedLayout
  if (!isAuthenticated) {
    return (
      <View 
        style={styles.container}
        accessibilityLabel="Authentication required"
        accessibilityRole="alert"
      >
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.text}>Authentication required.</Text>
        <Text style={styles.subText}>Please wait...</Text>
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