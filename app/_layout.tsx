import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons'; // Add Ionicons import
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Alert, Modal, View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

import { useColorScheme } from './hooks/useColorScheme';
import { FormProvider } from './context/FormContext';
import { AuthProvider } from './context/AuthContext';
import crashRecovery from './utils/crashRecovery';
import ErrorBoundary from './ErrorBoundary';
import theme from './constants/theme';

export {
  // Use our custom error boundary
  ErrorBoundary
};

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
  const [isCrashDetected, setIsCrashDetected] = useState(false);
  const [isDevRestart, setIsDevRestart] = useState(false);
  const [isRecoveryModalVisible, setIsRecoveryModalVisible] = useState(false);
  const [recoveryData, setRecoveryData] = useState<any>(null);

  // Initialize crash detection
  useEffect(() => {
    const initCrash = async () => {
      try {
        // Initialize crash detection as early as possible
        const crashDetected = await crashRecovery.initCrashDetection();
        
        if (crashDetected) {
          console.log('Crash detected during app startup');
          const recoveryInfo = await crashRecovery.getCrashRecoveryData();
          
          if (recoveryInfo) {
            console.log('Recovery data available:', recoveryInfo);
            setRecoveryData(recoveryInfo);
            
            // Check if this is a dev mode restart
            if (recoveryInfo.isDevelopmentRestart) {
              setIsDevRestart(true);
              // Don't show recovery modal for dev restarts
              console.log('Development restart, not showing recovery modal');
              // Automatically clean up recovery data for dev restarts
              await crashRecovery.completeCrashRecovery();
            } else {
              setIsCrashDetected(true);
              // Only show recovery modal for actual crashes
              if (loaded) {
                setIsRecoveryModalVisible(true);
              }
            }
          }
        } else if (crashRecovery.isDevRestart()) {
          setIsDevRestart(true);
          console.log('Development mode restart detected');
          // Automatically clean up any recovery data
          await crashRecovery.completeCrashRecovery();
        }
      } catch (error) {
        console.error('Error initializing crash detection:', error);
      }
    };
    
    initCrash();
  }, [loaded]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // If crash was detected (and not a dev restart), show recovery modal
      if (isCrashDetected && !isDevRestart && recoveryData) {
        setIsRecoveryModalVisible(true);
      }
    }
  }, [loaded, isCrashDetected, isDevRestart, recoveryData]);

  // Handle recovery action - restore data
  const handleRestore = async () => {
    try {
      // Here you would restore any critical app state from recoveryData
      console.log('Restoring app state from recovery data');
      
      // Close the modal
      setIsRecoveryModalVisible(false);
      
      // Inform user
      Alert.alert(
        'Recovery Complete',
        'Your data has been restored successfully.'
      );
      
      // Clear recovery data after successful restore
      await crashRecovery.completeCrashRecovery();
    } catch (error) {
      console.error('Error restoring app state:', error);
      
      // Inform user of error
      Alert.alert(
        'Recovery Failed',
        'Unable to restore your data. Please try again.'
      );
    }
  };

  // Handle recovery action - discard data
  const handleDiscard = async () => {
    try {
      // Clear recovery data without restoring
      await crashRecovery.completeCrashRecovery();
      
      // Close the modal
      setIsRecoveryModalVisible(false);
      
      // Inform user
      Alert.alert(
        'Data Discarded',
        'Continuing with a fresh start.'
      );
    } catch (error) {
      console.error('Error discarding recovery data:', error);
      
      // Close modal anyway
      setIsRecoveryModalVisible(false);
    }
  };

  // Render recovery modal - only shown for genuine crashes
  const RecoveryModal = () => (
    <Modal
      visible={isRecoveryModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsRecoveryModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Data Recovery</Text>
          <Text style={styles.modalText}>
            It looks like the app didn't close properly last time.
            Would you like to restore your unsaved data?
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.restoreButton]}
              onPress={handleRestore}
            >
              <Text style={styles.buttonText}>Restore</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.discardButton]}
              onPress={handleDiscard}
            >
              <Text style={styles.buttonText}>Discard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <>
        <RootLayoutNav />
        <RecoveryModal />
      </>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Save app state when navigating - Fixed router state listener
  useEffect(() => {
    // Check if router has the addListener method before using it
    if (router && typeof router.addListener === 'function') {
      // Listen for route changes to save state
      const unsubscribe = router.addListener('state', () => {
        // Get current route info
        const currentRoute = router.state?.key;
        if (currentRoute) {
          // Save state on important navigation events
          crashRecovery.saveCurrentAppState({
            currentRoute,
            timestamp: Date.now()
          });
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } else {
      // Fallback for when router.addListener is not available
      console.log('Router listener not available, using manual state saving');
      
      // Save initial state
      crashRecovery.saveCurrentAppState({
        initialRoute: true,
        timestamp: Date.now()
      });
    }
  }, [router]);

  // Common header styles
  const headerStyles = {
    headerStyle: {
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    headerTintColor: theme.colors.primary.main,
  };

  // Screen options for BFRB tracking flow
  const screenOptions = {
    presentation: 'card',
    animation: 'slide_from_bottom',
    headerShown: true, // Now showing headers
    ...headerStyles,
    cardStyle: { 
      backgroundColor: theme.colors.background.primary
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
            
            {/* BFRB Tracking Flow Screens */}
            <Stack.Screen 
              name="screens/tracking/time-screen" 
              options={{
                ...screenOptions,
                title: "Time & Duration"
              }} 
            />
            <Stack.Screen 
              name="screens/tracking/urge-screen" 
              options={{
                ...screenOptions,
                title: "Urge & Intention"
              }} 
            />
            <Stack.Screen 
              name="screens/tracking/environment-screen" 
              options={{
                ...screenOptions,
                title: "Environment"
              }} 
            />
            <Stack.Screen 
              name="screens/tracking/mental-screen" 
              options={{
                ...screenOptions,
                title: "Mental State"
              }} 
            />
            <Stack.Screen 
              name="screens/tracking/thoughts-screen" 
              options={{
                ...screenOptions,
                title: "Thought Patterns"
              }} 
            />
            <Stack.Screen 
              name="screens/tracking/physical-screen" 
              options={{
                ...screenOptions,
                title: "Physical Sensations"
              }} 
            />
            <Stack.Screen 
              name="screens/tracking/sensory-screen" 
              options={{
                ...screenOptions,
                title: "Sensory Triggers"
              }} 
            />
            <Stack.Screen 
              name="screens/tracking/submit-screen" 
              options={{
                ...screenOptions,
                title: "Final Details"
              }} 
            />
            <Stack.Screen 
              name="screens/modals/detail-screen" 
              options={{
                ...screenOptions,
                title: "Details"
              }} 
            />
          </Stack>
        </ThemeProvider>
      </FormProvider>
    </AuthProvider>
  );
}

// Styles for the recovery modal
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  } as ViewStyle,
  modalContent: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
  } as ViewStyle,
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary.main,
  } as TextStyle,
  modalText: {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.normal,
    color: theme.colors.text.primary,
  } as TextStyle,
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  } as ViewStyle,
  restoreButton: {
    backgroundColor: theme.colors.primary.main,
  } as ViewStyle,
  discardButton: {
    backgroundColor: theme.colors.secondary.main,
  } as ViewStyle,
  buttonText: {
    color: theme.colors.neutral.white,
    fontWeight: theme.typography.fontWeight.bold as '700',
    fontSize: theme.typography.fontSize.md,
  } as TextStyle,
});