import React from 'react';
import { StyleSheet, TouchableOpacity, Image, ViewStyle, TextStyle, ImageStyle, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '@/app/constants/theme';
import { View, Text } from '@/app/components';
import { errorService } from '@/app/services/ErrorService';

/**
 * Home screen component that displays the app logo and add new entry button
 * with modern UI design following the Armatillo guidelines
 */
export default function HomeScreen() {
  const router = useRouter();
  
  // Animation value for button press effect
  const [buttonScale] = React.useState(new Animated.Value(1));
  
  /**
   * Navigate to the time screen to begin the tracking flow
   */
  const addNewEntry = () => {
    try {
      // Animate button press
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
      
      // Navigate to time screen
      router.push('/screens/tracking/time-screen');
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), { 
        source: 'ui', 
        level: 'error',
        context: { action: 'navigate_to_time_screen' }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Armatillo</Text>
        <Text style={styles.subtitle}>BFRB Habit Reversal Tracker</Text>
      </View>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/armatillo-placeholder-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Centered Add Button with animation */}
      <View style={styles.addButtonContainer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={addNewEntry}
            activeOpacity={0.8}
            accessibilityLabel="Add new entry"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={28} color={theme.colors.primary.contrast} />
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.addButtonLabel}>Add New Entry</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  headerContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  } as ViewStyle,
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    color: theme.colors.text.primary,
    marginBottom: 4,
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  } as TextStyle,
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100, // Add space to account for the add button
  } as ViewStyle,
  logo: {
    width: 300,
    height: 300,
    opacity: 0.9, // Slightly reduce opacity for a more modern look
  } as ImageStyle,
  addButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100, // Ensure it's above other elements
  } as ViewStyle,
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.neutral.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  } as ViewStyle,
  addButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginTop: 4,
  } as TextStyle,
});