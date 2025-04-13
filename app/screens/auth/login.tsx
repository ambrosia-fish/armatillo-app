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
import { useAuth } from '@/app/context/AuthContext';

// Import themed components
import { View, Text, Button, Input, Card } from '@/app/components';
import theme from '@/app/constants/theme';
import ApprovalPendingModal from '../modals/approval-pending-modal';

export default function LoginScreen() {
  const { login, register, isLoading: authLoading, isPendingApproval } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  /**
   * Show the approval modal when pending approval state is detected
   */
  useEffect(() => {
    if (isPendingApproval) {
      setShowApprovalModal(true);
    } else {
      setShowApprovalModal(false);
    }
  }, [isPendingApproval]);

  /**
   * Validate form inputs
   */
  const validateForm = () => {
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
      console.log('LoginScreen: Attempting login');
      await login(email, password);
      console.log('LoginScreen: Login successful');
      // Navigation is handled by root layout
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
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
      console.log('LoginScreen: Attempting registration');
      await register({
        username,
        email,
        password,
        displayName: username
      });
      console.log('LoginScreen: Registration successful');
      
      // Navigation is handled by root layout
      setIsSignUp(false);
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle between login and signup forms
   */
  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    // Clear fields when switching modes
    setPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  // Determine if loading indicator should be shown
  const showLoading = authLoading || loading;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
            
            {showLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator 
                  size="large" 
                  color={theme.colors.primary.main} 
                  accessibilityLabel={isSignUp ? "Creating account" : "Signing in"}
                />
                <Text style={styles.loadingText}>
                  {isSignUp ? 'Creating your account...' : 'Signing you in...'}
                </Text>
              </View>
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
                  />
                )}

                <Button 
                  title={isSignUp ? 'Sign Up' : 'Login'}
                  onPress={isSignUp ? handleSignUp : handleLogin}
                  size="large"
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

      {/* Approval Pending Modal */}
      <ApprovalPendingModal 
        visible={showApprovalModal} 
        onClose={() => setShowApprovalModal(false)} 
      />
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  } as ViewStyle,
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  } as TextStyle,
});