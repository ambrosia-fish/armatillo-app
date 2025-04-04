import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { StyleSheet } from 'react-native';

import { useColorScheme } from './hooks/useColorScheme';
import { FormProvider } from './context/FormContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import theme from './constants/theme';
import { FA5Style } from '@expo/vector-icons/build/FontAwesome5';

export { ErrorBoundary };

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
          <Stack>
            <Stack.Screen 
              name="(tabs)" 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="screens/modals/modal" 
              options={{ presentation: 'modal' }} 
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
        </ThemeProvider>
      </FormProvider>
    </AuthProvider>
  );
}