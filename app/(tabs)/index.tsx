import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, ViewStyle, TextStyle, ImageStyle, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '@/app/styles/theme';
import { View, Text } from '@/app/components';
import { useAuth } from '@/app/store/contexts';

/**
 * Home screen component that displays the app logo and add new entry button
 * with modern UI design following the Armatillo guidelines
 */
export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  // Animation value for button press effect
  const [buttonScale] = useState(new Animated.Value(1));
  
  // Log for debugging
  useEffect(() => {
    console.log('HomeScreen: Mounted, auth status:', isAuthenticated);
  }, [isAuthenticated]);
  
  /**
   * Navigate to the new options screen to begin the tracking flow
   */
  const addNewEntry = () => {
    try {
      console.log('HomeScreen: Starting new entry');
      
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
      
      // Navigate to new options screen
      setTimeout(() => {
        router.push('/screens/tracking/new-options-screen');
      }, 150);
    } catch (error) {
      console.error('HomeScreen: Navigation error', error);
    }
  };

  /**
   * Navigate to the settings screen
   */
  const navigateToSettings = () => {
    try {
      console.log('HomeScreen: Navigating to settings');
      router.push('/screens/settings/settings-screen');
    } catch (error) {
      console.error('HomeScreen: Settings navigation error', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Armatillo</Text>
        <Text style={styles.subtitle}>Habit Reversal Tracker</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={navigateToSettings}
          activeOpacity={0.7}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          accessibilityHint="Navigate to settings screen"
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      {/* Welcome message with user name if available */}
      {user && user.displayName && (
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomePill}>
            <Text style={styles.welcomeText}>
              Welcome back, {user.displayName}
            </Text>
          </View>
        </View>
      )}
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/app/assets/images/armatillo-placeholder-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Armatillo logo"
        />
        <Text style={styles.aiDisclaimer}>AI art is placeholder</Text>
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
    position: 'relative',
    width: '100%',
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
  settingsButton: {
    position: 'absolute',
    right: 0,
    top: 4,
    padding: 8,
    borderRadius: 20,
  } as ViewStyle,
  welcomeContainer: {
    marginBottom: 16,
    alignItems: 'center',
  } as ViewStyle,
  welcomePill: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  } as ViewStyle,
  welcomeText: {
    fontSize: 16,
    color: theme.colors.primary.dark,
    fontWeight: '500',
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
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginTop: 4,
  } as TextStyle,
  aiDisclaimer: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  } as TextStyle
});