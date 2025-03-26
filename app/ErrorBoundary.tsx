import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ViewStyle, TextStyle } from 'react-native';
import { ErrorBoundary as ExpoErrorBoundary } from 'expo-router';
import crashRecovery from './utils/crashRecovery';
import theme from './constants/theme';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Custom error boundary with secure state cleanup
 * This extends the Expo Router ErrorBoundary with additional security features
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error and save important state
    console.error('Application error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Perform secure state cleanup in case of corruption
    this.performSecureCleanup(error);
  }
  
  /**
   * Perform secure state cleanup when an error occurs
   */
  async performSecureCleanup(error: Error): Promise<void> {
    try {
      // Store minimal error info for crash recovery
      await crashRecovery.saveCurrentAppState({
        error: {
          message: error.message,
          stack: error.stack,
          timestamp: Date.now()
        }
      });
      
      // Perform partial state cleanup
      // We keep some keys like authentication tokens to avoid forcing re-login
      const keysToKeep = [
        'auth_token', 
        'auth_refresh_token',
        'user_data'
      ];
      
      await crashRecovery.secureStateCleanup(keysToKeep);
    } catch (cleanupError) {
      console.error('Error during secure cleanup:', cleanupError);
    }
  }
  
  /**
   * Reset the error state and retry the app
   */
  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render fallback UI with retry button
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Oops, Something Went Wrong</Text>
            <Text style={styles.errorMessage}>
              The app encountered an unexpected error. Your data has been safely preserved.
            </Text>
            <Text style={styles.errorDetails}>
              {this.state.error && this.state.error.message}
            </Text>
            
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={this.handleRetry}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    // Use the Expo Router ErrorBoundary for the rest of the app
    return (
      <ExpoErrorBoundary 
        onError={(error: Error) => {
          // Also perform secure cleanup when Expo Router catches errors
          this.performSecureCleanup(error);
        }}
      >
        {this.props.children}
      </ExpoErrorBoundary>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  errorContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  errorTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginBottom: theme.spacing.lg,
    color: theme.colors.utility.error,
    textAlign: 'center',
  } as TextStyle,
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.text.primary,
  } as TextStyle,
  errorDetails: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xxl,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  retryButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  } as ViewStyle,
  retryButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle,
});

export default ErrorBoundary;
