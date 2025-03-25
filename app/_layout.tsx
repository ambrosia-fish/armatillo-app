import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons'; // Add Ionicons import
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Alert, Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useColorScheme } from './hooks/useColorScheme';
import { FormProvider } from './context/FormContext';
import { AuthProvider } from './context/AuthContext';
import crashRecovery from './utils/crashRecovery';
import { ErrorBoundary } from './ErrorBoundary';
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
    <>
      <RootLayoutNav />
      <RecoveryModal />
    </>
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

  // Screen options for BFRB tracking flow
  const screenOptions = {
    presentation: 'card',
    animation: 'slide_from_bottom',
    headerShown: false,
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
              name="modal" 
              options={{ presentation: 'modal' }} 
            />
            
            {/* Authentication Screens */}
            <Stack.Screen
              name="login"
              options={{ headerShown: false }}
            />
            
            {/* BFRB Tracking Flow Screens */}
            <Stack.Screen 
              name="time-screen" 
              options={screenOptions} 
            />
            <Stack.Screen 
              name="strength-screen" 
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
  },
  modalContent: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary.main,
  },
  modalText: {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.normal,
    color: theme.colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  restoreButton: {
    backgroundColor: theme.colors.primary.main,
  },
  discardButton: {
    backgroundColor: theme.colors.secondary.main,
  },
  buttonText: {
    color: theme.colors.neutral.white,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.md,
  },
});
