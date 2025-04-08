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
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';

// Import themed components
import { View, Text, Button, Input, Card } from '@/app/components';
import theme from '@/app/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, isAuthenticated, isLoading, isPendingApproval } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // If already authenticated, redirect to home
  if (isAuthenticated && !isLoading) {
    return <Redirect href="/(tabs)" />;
  }

  // If pending approval, show the modal
  useEffect(() => {
    if (isPendingApproval && !isLoading) {
      router.push('/screens/modals/approval-pending-modal');
    }
  }, [isPendingApproval, isLoading]);

  // Validate form inputs
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp) {
      if (!username) {
        newErrors.username = 'Username is required';
      }
      
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

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
      
      // Don't show success alert as AuthContext will handle it
      // and show the modal if needed
      setIsSignUp(false);
    } catch (error) {
      console.error('Registration error:', error);
      // Error is already handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    // Clear fields when switching modes
    setPassword('');
    setConfirmPassword('');
    setErrors({});
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
              <ActivityIndicator size="large" color={theme.colors.primary.main} style={styles.loading} />
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
                />

                <Input 
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={errors.password}
                />

                {isSignUp && (
                  <Input 
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    error={errors.confirmPassword}
                  />
                )}

                <Button 
                  title={isSignUp ? 'Sign Up' : 'Login'}
                  onPress={isSignUp ? handleSignUp : handleLogin}
                  size="large"
                  loading={loading}
                  style={styles.actionButton}
                />

                <Button 
                  title={isSignUp ? 'Already have an account? Login' : 'New user? Create an account'}
                  onPress={toggleSignUp}
                  variant="text"
                  size="medium"
                />
              </>
            )}
          </Card>
          
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>
              By using this app, you agree to our{' '}
              <Text style={styles.privacyLink} onPress={() => console.log('Show terms')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.privacyLink} onPress={() => console.log('Show privacy')}>
                Privacy Policy
              </Text>
            </Text>
          </View>
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