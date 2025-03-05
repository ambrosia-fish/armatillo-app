import { useEffect } from 'react';
import { useRouter, useNavigation } from 'expo-router';

/**
 * A utility component that handles gesture dismissal of screens
 * by navigating back to the home screen.
 * 
 * This component doesn't render anything - it just adds event listeners.
 */
export default function NavigationDismissHandler() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    // Function to handle gesture dismissal
    const handleGestureDismiss = () => {
      // Navigate back to home screen
      router.replace('/(tabs)');
    };

    // Add listener for when the screen is dismissed by gesture
    const unsubscribe = navigation.addListener('gestureEnd', (e) => {
      // Check if this is a dismiss gesture
      if (e.data?.closing) {
        handleGestureDismiss();
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [navigation, router]);

  // This component doesn't render anything
  return null;
}
