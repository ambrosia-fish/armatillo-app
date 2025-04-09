import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen } from 'expo-router';
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
 * Main app layout that handles initialization and authentication
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
        setTimeout(() => {
          setIsReady(true);
        }, 100);
      }).catch(error => {
        console.error('RootLayout: Error hiding splash screen:', error);
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
              <StackNavigator />
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
 * Main stack navigator with auth protection
 */
function StackNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading screen while determining auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }
  
  // Define all app routes
  return (
    <Stack>
      {/* Auth screen */}
      <Stack.Screen 
        name="screens/auth/login" 
        options={{ headerShown: false }}
        redirect={isAuthenticated}
      />
      
      {/* Tabs - with required auth */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }}
        redirect={!isAuthenticated}
      />
      
      {/* Modal Screens */}
      <Stack.Screen 
        name="screens/modals/modal" 
        options={{ 
          presentation: 'modal',
          headerShown: false
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
      <Stack.Screen name="screens/tracking/new-options-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/tracking/new-entry-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/tracking/time-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/tracking/urge-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/tracking/environment-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/tracking/mental-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/tracking/thoughts-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/tracking/physical-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/tracking/sensory-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/tracking/submit-screen" options={{ headerShown: false }} />
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