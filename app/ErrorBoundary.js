import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { ErrorBoundary as ExpoErrorBoundary } from 'expo-router';
import crashRecovery from './utils/crashRecovery';

/**
 * Custom error boundary with secure state cleanup
 * This extends the Expo Router ErrorBoundary with additional security features
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error and save important state
    console.error('Application error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Perform secure state cleanup in case of corruption
    this.performSecureCleanup(error);
  }
  
  /**
   * Perform secure state cleanup when an error occurs
   */
  async performSecureCleanup(error) {
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
  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
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
        onError={(error) => {
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
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#e63946',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  errorDetails: {
    fontSize: 14,
    marginBottom: 30,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2a9d8f',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorBoundary;
