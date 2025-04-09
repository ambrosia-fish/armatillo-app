import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, SplashScreen } from 'expo-router';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { StyleSheet } from 'react-native';

import { useColorScheme } from './hooks/useColorScheme';
import { FormProvider } from './context/FormContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import theme from './constants/theme';

export { ErrorBoundary };

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Root layout component
 */
export default function RootLayout() {
  // Always declare all hooks at the top level
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  // Add colorScheme here so it's consistent in all renders
  const colorScheme = useColorScheme();
  
  // State to track initialization
  const [layoutReady, setLayoutReady] = useState(false);
  
  // Use ref to track if we've already hidden the splash screen
  const splashHiddenRef = useRef(false);
  
  // Handle error state
  useEffect(() => {
    if (error) throw error;
  }, [error]);
  
  // Hide splash screen when fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (loaded && !splashHiddenRef.current) {
      try {
        splashHiddenRef.current = true;
        await SplashScreen.hideAsync();
        console.log('Splash screen hidden');
        
        // Set layout ready after splash screen is hidden
        setTimeout(() => {
          setLayoutReady(true);
        }, 100);
      } catch (e) {
        console.error('Error hiding splash screen:', e);
      }
    }
  }, [loaded]);
  
  // Always return null for the same condition
  if (!loaded) {
    return null;
  }
  
  // Return the root stack navigator
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FormProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigator onLayout={onLayoutRootView} />
          </ThemeProvider>
        </FormProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

interface RootNavigatorProps {
  onLayout: () => Promise<void>;
}

/**
 * Root navigator component with stack navigation
 */
function RootNavigator({ onLayout }: RootNavigatorProps) {
  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'default',
          gestureEnabled: false,
        }}>
        {/* Authentication Screens */}
        <Stack.Screen
          name="screens/auth/login"
          options={{ headerShown: false }}
        />
        
        {/* Main App Screens */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        
        {/* Modal Screens */}
        <Stack.Screen 
          name="screens/modals/modal" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }} 
        />
        <Stack.Screen 
          name="screens/modals/approval-pending-modal" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        
        {/* Tracking Screens */}
        <Stack.Screen 
          name="screens/tracking/new-options-screen" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="screens/tracking/new-entry-screen" 
          options={{ headerShown: false }} 
        />
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
    </View>
  );
}