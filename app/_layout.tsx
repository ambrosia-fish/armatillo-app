import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { FormProvider } from './context/FormContext';

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

  // Screen options for BFRB tracking flow
  // This hides previous screens when a new screen is displayed
  const screenOptions = {
    presentation: 'card',
    animation: 'slide_from_bottom',
    headerShown: false,
    cardStyle: { 
      backgroundColor: '#fff' 
    },
    cardOverlayEnabled: true,
    cardStyleInterpolator: ({ current: { progress } }) => ({
      cardStyle: {
        opacity: progress,
      },
    }),
    gestureEnabled: false // Disable swipe down gesture since we want screens to stack visually
  };

  return (
    <FormProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="modal" 
            options={{ presentation: 'modal' }} 
          />
          
          {/* BFRB Tracking Flow Screens */}
          <Stack.Screen 
            name="time-screen" 
            options={screenOptions} 
          />
          <Stack.Screen 
            name="detail-screen" 
            options={screenOptions} 
          />
          <Stack.Screen 
            name="environment-screen" 
            options={screenOptions} 
          />
          <Stack.Screen 
            name="feelings-screen" 
            options={screenOptions} 
          />
          <Stack.Screen 
            name="thoughts-screen" 
            options={screenOptions} 
          />
          <Stack.Screen 
            name="notes-screen" 
            options={screenOptions} 
          />
        </Stack>
      </ThemeProvider>
    </FormProvider>
  );
}
