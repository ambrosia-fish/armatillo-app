import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
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
 * Root layout component that handles app initialization
 */
export default function RootLayout() {
  // All hooks need to be called in the same order every time
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  // Always initialize these hooks, even if we don't use them in some cases
  const colorScheme = useColorScheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const initializedRef = useRef(false);
  
  // Handle font loading errors
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded && !initializedRef.current) {
      initializedRef.current = true;
      SplashScreen.hideAsync().then(() => {
        // Short delay to ensure everything has mounted
        setTimeout(() => {
          setIsInitialized(true);
          setIsReady(true);
        }, 100);
      }).catch(error => {
        console.error('Error hiding splash screen:', error);
        setIsInitialized(true);
        setIsReady(true);
      });
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
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {isReady ? <RootNavigator /> : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
              </View>
            )}
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
  const navigationCountRef = useRef(0);

  // Handle authentication-based navigation
  useEffect(() => {
    // Skip navigation during loading or when already navigating
    if (isLoading || isNavigating) {
      return;
    }

    // Check if we're in an auth screen
    const inAuthGroup = segments[0] === 'screens' && segments[1] === 'auth';
    
    // Prevent too many navigation attempts in a single session
    if (navigationCountRef.current > 2) {
      console.log('Navigation: Too many navigation attempts, resetting counter');
      navigationCountRef.current = 0;
      return;
    }
    
    setIsNavigating(true);
    navigationCountRef.current += 1;
    
    try {
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
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
    }
  }, [isAuthenticated, isLoading, segments, router, isNavigating]);

  // Show loading indicator during auth check or navigation
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