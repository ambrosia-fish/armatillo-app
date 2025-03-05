import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { TransitionPresets } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Platform } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Custom transition options that hide previous screens
  const customTransitionOptions = {
    presentation: 'card',
    animation: 'slide_from_bottom',
    headerShown: false,
    cardStyle: { backgroundColor: '#fff' },
    cardOverlayEnabled: true,
    // Add custom animation without relying on TransitionPresets
    cardStyleInterpolator: ({ current: { progress } }) => ({
      cardStyle: {
        opacity: progress,
      },
    }),
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="time-screen" 
          options={customTransitionOptions} 
        />
        <Stack.Screen 
          name="detail-screen" 
          options={customTransitionOptions} 
        />
        <Stack.Screen 
          name="environment-screen" 
          options={customTransitionOptions} 
        />
        <Stack.Screen 
          name="feelings-screen" 
          options={customTransitionOptions} 
        />
        <Stack.Screen 
          name="thoughts-screen" 
          options={customTransitionOptions} 
        />
        <Stack.Screen 
          name="notes-screen" 
          options={customTransitionOptions} 
        />
      </Stack>
    </ThemeProvider>
  );
}
