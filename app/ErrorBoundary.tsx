import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { errorService } from './services/ErrorService';
import theme from './constants/theme';
import { Button } from './components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    errorService.handleError(error, {
      source: 'ui',
      level: 'critical',
      context: { 
        componentStack: errorInfo.componentStack,
        component: 'ErrorBoundary' 
      }
    });
  }

  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            We're sorry, but an unexpected error occurred.
          </Text>
          <View style={styles.errorDetails}>
            <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
          </View>
          <Button 
            title="Try Again" 
            onPress={this.resetErrorBoundary}
            variant="primary" 
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background.primary
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.utility.error
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: theme.colors.text.primary
  },
  errorDetails: {
    backgroundColor: theme.colors.background.secondary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%'
  },
  errorMessage: {
    color: theme.colors.text.secondary,
    fontSize: 14
  }
});

export default ErrorBoundary;