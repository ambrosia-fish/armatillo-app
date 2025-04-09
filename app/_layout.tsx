import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen, Slot, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const initializedRef = useRef(false);
  
  // Handle font loading errors
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (fontsLoaded && !initializedRef.current) {
      initializedRef.current = true;
      console.log('RootLayout: Fonts loaded, hiding splash screen');
      
      SplashScreen.hideAsync().then(() => {
        console.log('RootLayout: Splash screen hidden');
        // Short delay to ensure everything has mounted properly
        setTimeout(() => {
          setIsInitialized(true);
          setIsReady(true);
        }, 100);
      }).catch(error => {
        console.error('RootLayout: Error hiding splash screen:', error);
        setIsInitialized(true);
        setIsReady(true);
      });
    }
  }, [fontsLoaded]);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <FormProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {isReady ? (
              // Use Root Layout with Slot for initial render to ensure proper mounting
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
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const router = useRouter();
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log('RootNavigator: Auth state updated - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'authState:', authState);
  }, [isAuthenticated, isLoading, authState]);
  
  // Ensure navigation is ready after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
      console.log('RootNavigator: Navigation ready');
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle routing for pending approval state
  useEffect(() => {
    if (isNavigationReady && !isLoading && authState === AuthState.PENDING_APPROVAL) {
      console.log('RootNavigator: User pending approval, navigating to approval modal');
      router.replace('/screens/modals/approval-pending-modal');
    }
  }, [isNavigationReady, isLoading, authState, router]);
  
  // Show loading indicator while auth state is loading
  if (isLoading || !isNavigationReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }
  
  // IMPORTANT: First, render a Slot to ensure Root Layout is properly mounted
  // This resolves the "navigate before mounting" error
  return (
    <Stack initialRouteName={isAuthenticated ? '(tabs)' : 'screens/auth/login'}>
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
      <Stack.Screen name="screens/modals/detail-screen" options={{ headerShown: false }} />
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