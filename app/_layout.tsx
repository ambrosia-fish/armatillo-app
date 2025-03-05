import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

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
  const router = useRouter();

  // Handler for when a screen is dismissed with a swipe
  const handleSwipeDown = () => {
    // Navigate to home tab instead of previous screen
    router.replace('/(tabs)');
    return true; // Prevent default behavior
  };

  // Common screen options for flow screens
  const flowScreenOptions = {
    presentation: 'modal',
    animation: 'slide_from_bottom',
    headerShown: false,
    gestureEnabled: true,
    gestureDirection: 'vertical',
    gestureResponseDistance: 100, // How far you need to swipe (in pixels)
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenListeners={{
        // Listen for gesture-based dismissal and handle it
        transitionEnd: (e) => {
          if (e.data.closing) {
            handleSwipeDown();
          }
        }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="time-screen" options={flowScreenOptions} />
        <Stack.Screen name="detail-screen" options={flowScreenOptions} />
        <Stack.Screen name="environment-screen" options={flowScreenOptions} />
        <Stack.Screen name="feelings-screen" options={flowScreenOptions} />
        <Stack.Screen name="thoughts-screen" options={flowScreenOptions} />
        <Stack.Screen name="notes-screen" options={flowScreenOptions} />
      </Stack>
    </ThemeProvider>
  );
}
