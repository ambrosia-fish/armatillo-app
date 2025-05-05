import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/store/contexts';
import theme from './styles/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      if (Platform.OS === 'web') {
        // More reliable redirect on web
        window.location.href = '/screens/auth/login';
      } else {
        // Native platform routing
        router.replace('/screens/auth/login');
      }
    }
  }, [isAuthenticated]);
  
  // Handle navigation back to home
  const handleGoHome = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      if (Platform.OS === 'web') {
        window.location.href = '/screens/auth/login';
      } else {
        router.replace('/screens/auth/login');
      }
    }
  };

  // Show redirect message for unauthenticated users
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.utility.error} />
        <Text style={styles.title}>Authentication Required</Text>
        <Text style={styles.subtitle}>Redirecting to login page...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={80} color={theme.colors.utility.warning} />
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>We couldn't find the page you were looking for.</Text>
      <TouchableOpacity style={styles.button} onPress={handleGoHome}>
        <Text style={styles.buttonText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.primary.contrast,
    fontSize: 16,
    fontWeight: 'bold',
  },
});