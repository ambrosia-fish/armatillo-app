import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native';

import { useColorScheme } from './hooks/useColorScheme';
import { FormProvider } from './context/FormContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import theme from './constants/theme';

export { ErrorBoundary };

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Root layout component that handles app initialization and auth flow
 */
export default function RootLayout() {
  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Handle font loading errors
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Don't render the app until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <FormProvider>
          <ThemeProvider value={useColorScheme() === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigator />
          </ThemeProvider>
        </FormProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

/**
 * Main navigator with central route protection
 */
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Handle authentication-based navigation
  useEffect(() => {
    // Skip navigation during loading or when already navigating
    if (isLoading || isNavigating) return;

    const inAuthGroup = segments[0] === 'screens' && segments[1] === 'auth';
    
    setIsNavigating(true);
    
    if (!isAuthenticated && !inAuthGroup) {
      // If not authenticated and not on auth screens, go to login
      console.log('Navigation: Redirecting to login');
      setTimeout(() => {
        router.replace('/screens/auth/login');
        setIsNavigating(false);
      }, 100);
    } else if (isAuthenticated && inAuthGroup) {
      // If authenticated and on auth screens, go to home
      console.log('Navigation: Redirecting to home');
      setTimeout(() => {
        router.replace('/(tabs)');
        setIsNavigating(false);
      }, 100);
    } else {
      // Otherwise just clear the navigating flag
      setIsNavigating(false);
    }
  }, [isAuthenticated, isLoading, segments, router, isNavigating]);

  // Show loading indicator during auth check
  if (isLoading || isNavigating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  // Define all app routes without any conditional logic
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth screens */}
      <Stack.Screen name="screens/auth/login" />
      
      {/* Main app */}
      <Stack.Screen name="(tabs)" />
      
      {/* Modal Screens */}
      <Stack.Screen 
        name="screens/modals/modal" 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen 
        name="screens/modals/approval-pending-modal" 
        options={{ 
          presentation: 'modal',
          gestureEnabled: false,
        }} 
      />
      
      {/* Tracking Screens */}
      <Stack.Screen name="screens/tracking/new-options-screen" />
      <Stack.Screen name="screens/tracking/new-entry-screen" />
      <Stack.Screen name="screens/tracking/time-screen" />
      <Stack.Screen name="screens/tracking/urge-screen" />
      <Stack.Screen name="screens/tracking/environment-screen" />
      <Stack.Screen name="screens/tracking/mental-screen" />
      <Stack.Screen name="screens/tracking/thoughts-screen" />
      <Stack.Screen name="screens/tracking/physical-screen" />
      <Stack.Screen name="screens/tracking/sensory-screen" />
      <Stack.Screen name="screens/tracking/submit-screen" />
      <Stack.Screen name="screens/modals/detail-screen" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
});