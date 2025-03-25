import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { useAuth } from './context/AuthContext';
import api from './services/api';

export default function LoginScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to home
  if (isAuthenticated && !isLoading) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await api.auth.login(email, password);
      console.log('Login successful:', response);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await api.auth.register({
        username,
        email,
        password,
        displayName: username
      });
      console.log('Registration successful:', response);
      Alert.alert('Success', 'Account created successfully! Please log in.');
      setIsSignUp(false);
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    // Clear fields when switching modes
    setPassword('');
    setConfirmPassword('');
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
              source={require('../assets/images/icon.png')}
              style={styles.logo}
            />
            <Text style={styles.appName}>Armatillo</Text>
            <Text style={styles.tagline}>Track your BFRB habits</Text>
          </View>
          
          {/* Login form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isSignUp ? 'Create an Account' : 'Sign in to continue'}
            </Text>
            
            {isLoading || loading ? (
              <ActivityIndicator size="large" color="#2a9d8f" style={styles.loading} />
            ) : (
              <>
                {isSignUp && (
                  <TextInput 
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                )}

                <TextInput 
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput 
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                {isSignUp && (
                  <TextInput 
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                )}

                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={isSignUp ? handleSignUp : handleLogin}
                >
                  <Text style={styles.buttonText}>
                    {isSignUp ? 'Sign Up' : 'Login'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={toggleSignUp}
                >
                  <Text style={styles.secondaryButtonText}>
                    {isSignUp ? 'Already have an account? Login' : 'New user? Create an account'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
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
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2a9d8f',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  primaryButton: {
    backgroundColor: '#2a9d8f',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2a9d8f',
    fontSize: 14,
    fontWeight: '500',
  },
  privacyContainer: {
    marginTop: 'auto',
    marginBottom: 10,
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  privacyLink: {
    color: '#2a9d8f',
    fontWeight: '500',
  },
  loading: {
    marginVertical: 30,
  },
});
