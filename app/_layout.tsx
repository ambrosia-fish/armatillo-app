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
import { FA5Style } from '@expo/vector-icons/build/FontAwesome5';

export { ErrorBoundary };

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Auth protected layout
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const [redirected, setRedirected] = useState(false);
  
  // Non-protected routes - these don't require authentication
  const publicRoutes = [
    '/screens/auth/login',
    '/+not-found',
    '/'
  ];
  
  // Check if current route needs protection
  const needsAuth = !publicRoutes.some(route => pathname.includes(route));
  
  useEffect(() => {
    // If path needs auth and user is not authenticated, redirect
    if (!isLoading && needsAuth && !isAuthenticated && !redirected) {
      setRedirected(true);
      if (Platform.OS === 'web') {
        // For more reliable web navigation
        window.location.href = '/screens/auth/login';
      } else {
        // For native navigation
        window.setTimeout(() => {
          try {
            window.location.replace('/screens/auth/login');
          } catch (e) {
            console.error("Native navigation error:", e);
          }
        }, 100);
      }
    }
  }, [isLoading, isAuthenticated, pathname, needsAuth, redirected]);
  
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
        <Text style={styles.loadingText}>Redirecting to login...</Text>
      </View>
    );
  }
  
  // Otherwise render children
  return children;
}

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

  // Fix progress parameter type issue
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
              <Stack.Screen 
                name="(tabs)" 
                options={{ headerShown: false }} 
              />
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
});