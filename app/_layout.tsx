import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { StyleSheet } from 'react-native';

import { useColorScheme } from './hooks/useColorScheme';
import { FormProvider } from './context/FormContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import theme from './constants/theme';
import { errorService } from './services/ErrorService';

export { ErrorBoundary };

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * Protected layout for authenticated routes
 */
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, authState } = useAuth();
  const pathname = usePathname();
  
  // Non-protected routes - these don't require authentication
  const publicRoutes = [
    '/screens/auth/login',
    '/+not-found',
    '/'
  ];
  
  // Check if current route needs protection
  const needsAuth = !publicRoutes.some(route => pathname.includes(route));
  
  // Log route information for debugging
  useEffect(() => {
    console.log(`ProtectedLayout: Path '${pathname}', needsAuth: ${needsAuth}, authState: ${authState}`);
  }, [pathname, needsAuth, authState]);

  // Handle navigation based on auth state and route
  useEffect(() => {
    // Skip during loading phase
    if (isLoading) return;
    
    try {
      // If path needs auth and user is not authenticated, handle navigation
      // This is a fallback - the AuthContext should handle most navigation based on auth state
      if (needsAuth && !isAuthenticated) {
        console.log('ProtectedLayout: Path requires auth but user is not authenticated');
        
        // Use a small timeout to prevent navigation race conditions
        const timer = setTimeout(() => {
          try {
            // Navigate to login
            if (Platform.OS === 'web') {
              // For web, avoid expo-router sometimes
              window.location.href = '/';
            } else {
              // For native, use router
              window.location.replace('/');
            }
          } catch (error) {
            errorService.handleError(error instanceof Error ? error : String(error), {
              source: 'navigation',
              level: 'warning',
              context: { component: 'ProtectedLayout', action: 'redirect' }
            });
          }
        }, 150);
        
        // Cleanup timer on unmount
        return () => clearTimeout(timer);
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'navigation',
        context: { component: 'ProtectedLayout', action: 'checkAuth' }
      });
    }
  }, [isLoading, isAuthenticated, pathname, needsAuth]);
  
  // If loading, show loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  // If needs auth but not authenticated, show loading while redirecting
  if (needsAuth && !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Please wait...</Text>
        <Text style={styles.subText}>Redirecting to login...</Text>
      </View>
    );
  }
  
  // Otherwise render children
  return children;
}

/**
 * Root layout component
 */
export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

/**
 * Root navigation layout
 */
function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Fix the typing issues by using plain objects instead of ViewStyle
  const headerStyles = {
    headerStyle: {
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.text.primary,
    },
    headerTintColor: theme.colors.primary.main,
    headerBackTitle: 'Back',
  };

  // Fixed screen options
  const screenOptions = {
    presentation: 'card' as const,
    animation: 'slide_from_bottom' as const,
    headerShown: false,
    cardStyle: {
      backgroundColor: theme.colors.background.primary,
    },
    cardOverlayEnabled: true,
    cardStyleInterpolator: ({ current }: { current: { progress: number } }) => ({
      cardStyle: {
        opacity: current.progress,
      },
    }),
    gestureEnabled: false,
  };

  return (
    <AuthProvider>
      <FormProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ProtectedLayout>
            <Stack>
              {/* Tab Screens */}
              <Stack.Screen 
                name="(tabs)" 
                options={{ headerShown: false }} 
              />
              
              {/* Modal Screen */}
              <Stack.Screen 
                name="screens/modals/modal" 
                options={{ presentation: 'modal' }} 
              />
              
              {/* Modal Screens */}
              <Stack.Screen 
                name="screens/modals/approval-pending-modal" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                  gestureEnabled: false,
                }} 
              />
              
              {/* Authentication Screens */}
              <Stack.Screen
                name="screens/auth/login"
                options={{ headerShown: false }}
              />
              
              {/* New Tracking Screens */}
              <Stack.Screen 
                name="screens/tracking/new-options-screen" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="screens/tracking/new-entry-screen" 
                options={{ headerShown: false }} 
              />
              
              {/* Existing tracking screens we'll still need for the flow */}
              <Stack.Screen 
                name="screens/tracking/time-screen" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="screens/tracking/urge-screen" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="screens/tracking/environment-screen" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="screens/tracking/mental-screen" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="screens/tracking/thoughts-screen" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="screens/tracking/physical-screen" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="screens/tracking/sensory-screen" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="screens/tracking/submit-screen" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="screens/modals/detail-screen" 
                options={{ headerShown: false }} 
              />
            </Stack>
          </ProtectedLayout>
        </ThemeProvider>
      </FormProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
