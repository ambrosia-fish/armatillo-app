import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen, Slot, useRouter } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native';

import { useColorScheme } from './hooks/useColorScheme';
import { FormProvider } from './context/FormContext';
import { AuthProvider, useAuth, AuthState } from './context/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import theme from './constants/theme';

export { ErrorBoundary };

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Main app layout that handles initialization
 * Using two-phase mounting pattern to ensure layout is fully mounted before navigation
 */
export default function RootLayout() {
  // Always declare all hooks at the top level
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  // Add colorScheme here so it's consistent in all renders
  const colorScheme = useColorScheme();
  
  // State to track initialization
  const [appReady, setAppReady] = useState(false);
  const initializedRef = useRef(false);
  
  // Handle font loading errors
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Handle app initialization when fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !initializedRef.current) {
      initializedRef.current = true;
      console.log('RootLayout: Fonts loaded, hiding splash screen');
      
      try {
        await SplashScreen.hideAsync();
        console.log('RootLayout: Splash screen hidden');
        setAppReady(true);
      } catch (error) {
        console.error('RootLayout: Error hiding splash screen:', error);
        setAppReady(true);
      }
    }
  }, [fontsLoaded]);

  // Call onLayoutRootView when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      onLayoutRootView();
    }
  }, [fontsLoaded, onLayoutRootView]);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <FormProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {appReady ? (
              <RootNavigator />
            ) : (
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
 * Root navigator with centralized auth protection
 * Using Slot ensures proper mounting before navigation occurs
 */
function RootNavigator() {
  const { isAuthenticated, isLoading, authState } = useAuth();
  const router = useRouter();
  
  // Unified effect for auth-based navigation
  useEffect(() => {
    // Log authentication state for debugging
    console.log('RootNavigator: Auth state updated - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'authState:', authState);
    
    // Only handle navigation when auth loading is complete
    if (!isLoading) {
      // Priority 1: Handle pending approval state (highest priority)
      if (authState === AuthState.PENDING_APPROVAL) {
        console.log('RootNavigator: User pending approval, navigating to approval modal');
        router.replace('/screens/modals/approval-pending-modal');
      } 
      // Priority 2: Navigate based on authentication status
      else if (isAuthenticated) {
        console.log('RootNavigator: User authenticated, navigating to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('RootNavigator: User not authenticated, navigating to login');
        router.replace('/screens/auth/login');
      }
    }
  }, [isLoading, isAuthenticated, authState, router]);
  
  // Show loading indicator while auth state is loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }
  
  // Define the navigation structure
  // Redirect properties are used as a fallback to the primary navigation logic above
  return (
    <Stack>
      <Stack.Screen 
        name="screens/auth/login" 
        options={{ headerShown: false }} 
        redirect={isAuthenticated && authState !== AuthState.PENDING_APPROVAL}
      />
      
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
        redirect={!isAuthenticated || authState === AuthState.PENDING_APPROVAL}
      />
      
      {/* Modal Screens */}
      <Stack.Screen 
        name="screens/modals/approval-pending-modal" 
        options={{ 
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: false,
        }} 
        redirect={authState !== AuthState.PENDING_APPROVAL}
      />
      
      {/* Tracking Screens */}
      <Stack.Screen name="screens/tracking/new-options-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/tracking/new-entry-screen" options={{ headerShown: false }} />
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