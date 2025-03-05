import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, 
  StyleSheet, 
  PanResponder, 
  Animated,
  Dimensions
} from 'react-native';

interface SwipeDownToHomeProps {
  children: React.ReactNode;
}

/**
 * A component that wraps screen content and enables swiping down to go back to home
 * while preserving normal back button functionality.
 */
export default function SwipeDownToHome({ children }: SwipeDownToHomeProps) {
  const router = useRouter();
  const [translateY] = useState(new Animated.Value(0));
  
  // Threshold for considering the swipe complete (in pixels)
  const DISMISS_THRESHOLD = 150;
  const SCREEN_HEIGHT = Dimensions.get('window').height;

  const navigateToHome = () => {
    // Navigate back to home screen
    router.replace('/(tabs)');
  };

  // Set up pan responder for gesture handling
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to downward gestures with significant movement
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD) {
          // If swiped down past threshold, continue animation and navigate to home
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true
          }).start(() => {
            navigateToHome();
          });
        } else {
          // Otherwise, spring back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 5
          }).start();
        }
      },
    })
  ).current;

  // Calculate opacity based on translateY
  const opacity = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content, 
          { 
            transform: [{ translateY: translateY }],
            opacity: opacity
          }
        ]} 
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  }
});
