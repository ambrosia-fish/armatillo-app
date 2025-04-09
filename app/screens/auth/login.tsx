import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ViewStyle,
  TextStyle,
  ImageStyle
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';

// Import themed components
import { View, Text, Button, Input, Card } from '@/app/components';
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, isAuthenticated, isLoading, isPendingApproval, authState } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Log auth state for debugging
  useEffect(() => {
    console.log('LoginScreen: Auth state:', authState, 'isAuthenticated:', isAuthenticated);
  }, [authState, isAuthenticated]);

  // Handle redirection based on authentication state changes
  useEffect(() => {
    if (isLoading) return;

    try {
      if (isAuthenticated) {
        console.log('LoginScreen: User is authenticated, navigating to tabs...');
        // Let ProtectedLayout handle navigation to avoid race conditions
      } else if (isPendingApproval) {
        console.log('LoginScreen: User account is pending approval, navigating...');
        // Let ProtectedLayout handle navigation to avoid race conditions
      }
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        source: 'navigation',
        level: 'warning',
        context: { component: 'LoginScreen', action: 'navigationEffect' }
      });
    }
  }, [isAuthenticated, isPendingApproval, isLoading]);

  /**
   * Validate form inputs
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    try {
      const newErrors: {[key: string]: string} = {};
      
      // Email validation
      if (!email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      // Password validation
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      // Sign up specific validations
      if (isSignUp) {
        if (!username) {
          newErrors.username = 'Username is required';
        } else if (username.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        }
        
        if (password !== confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        source: 'ui',
        level: 'warning',
        context: { component: 'LoginScreen', action: 'validateForm' }
      });
      return false;
    }
  };

  /**
   * Handle login form submission
   */
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // Navigation is handled by AuthContext state changes
    } catch (error) {
      // Error is already handled by AuthContext
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle sign up form submission
   */
  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await register({
        username,
        email,
        password,
        displayName: username
      });
      
      // Navigation is handled by AuthContext state changes
      setIsSignUp(false);
    } catch (error) {
      // Error is already logged and displayed by AuthContext
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle between login and signup forms
   */
  const toggleSignUp = () => {
    try {
      setIsSignUp(!isSignUp);
      // Clear fields when switching modes
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        source: 'ui',
        level: 'warning',
        context: { component: 'LoginScreen', action: 'toggleSignUp' }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo and app name */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/armatillo-placeholder-logo.png')}
              style={styles.logo}
              accessibilityLabel="Armatillo logo"
            />
            <Text style={styles.appName}>Armatillo</Text>
            <Text style={styles.tagline}>Track your BFRB habits</Text>
          </View>
          
          {/* Login form */}
          <Card containerStyle={styles.formCard}>
            <Text style={styles.formTitle}>
              {isSignUp ? 'Create an Account' : 'Sign in to continue'}
            </Text>
            
            {isLoading || loading ? (
              <ActivityIndicator 
                size="large" 
                color={theme.colors.primary.main} 
                style={styles.loading}
                accessibilityLabel={isSignUp ? "Creating account" : "Signing in"}
              />
            ) : (
              <>
                {isSignUp && (
                  <Input 
                    label="Username"
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    error={errors.username}
                    testID="username-input"
                    accessibilityLabel="Username input"
                    accessibilityHint="Enter your username, minimum 3 characters"
                  />
                )}

                <Input 
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  testID="email-input"
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address"
                />

                <Input 
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={errors.password}
                  testID="password-input"
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password, minimum 6 characters"
                />

                {isSignUp && (
                  <Input 
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    error={errors.confirmPassword}
                    testID="confirm-password-input"
                    accessibilityLabel="Confirm password input"
                    accessibilityHint="Enter your password again to confirm"
                  />
                )}

                <Button 
                  title={isSignUp ? 'Sign Up' : 'Login'}
                  onPress={isSignUp ? handleSignUp : handleLogin}
                  size="large"
                  loading={loading}
                  style={styles.actionButton}
                  testID={isSignUp ? "signup-button" : "login-button"}
                  accessibilityLabel={isSignUp ? "Sign up button" : "Login button"}
                />

                <Button 
                  title={isSignUp ? 'Already have an account? Login' : 'New user? Create an account'}
                  onPress={toggleSignUp}
                  variant="text"
                  size="medium"
                  testID="toggle-auth-mode-button"
                  accessibilityLabel={isSignUp ? "Switch to login" : "Switch to sign up"}
                />
              </>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  keyboardView: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  } as ViewStyle,
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: theme.spacing.md,
  } as ImageStyle,
  appName: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  tagline: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  formCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
  } as ViewStyle,
  formTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.text.primary,
  } as TextStyle,
  actionButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  privacyContainer: {
    marginTop: 'auto',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  privacyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  privacyLink: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
  loading: {
    marginVertical: theme.spacing.xl,
  } as ViewStyle,
});