import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, ViewStyle, TextStyle, ImageStyle, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '@/app/constants/theme';
import { View, Text } from '@/app/components';
import { isInStandaloneMode } from '@/app/utils/pwaUtils';

export default function HomeScreen() {
  const router = useRouter();
  const [isPwa, setIsPwa] = useState(false);
  
  // Detect if running in PWA mode
  useEffect(() => {
    if (Platform.OS === 'web') {
      const isStandalone = isInStandaloneMode();
      setIsPwa(isStandalone);
      
      // Add explicit class to the floating action button for PWA styling
      if (isStandalone && typeof document !== 'undefined') {
        setTimeout(() => {
          // Find and add classes to the add button for PWA styling
          const fabContainer = document.querySelector('.add-button-container');
          const fabElement = document.querySelector('.add-button');
          
          if (fabContainer) {
            fabContainer.classList.add('expo-fab-container');
            console.log('Added PWA class to FAB container');
          }
          
          if (fabElement) {
            fabElement.classList.add('expo-fab');
            console.log('Added PWA class to FAB');
          }
        }, 300);
      }
    }
  }, []);
  
  const addNewEntry = () => {
    // Navigate to the time screen with updated path
    router.push('/screens/tracking/time-screen');
  };

  // Get specific styles for PWA mode
  const getAddButtonContainerStyle = () => {
    const baseStyle = styles.addButtonContainer;
    
    if (isPwa && Platform.OS === 'web') {
      return [
        baseStyle,
        {
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 70px)',
          left: 0,
          right: 0,
          zIndex: 999,
        }
      ];
    }
    
    return baseStyle;
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
      
      {/* Centered Add Button with PWA-specific adjustments */}
      <View 
        style={getAddButtonContainerStyle()}
        className="add-button-container"
      >
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={addNewEntry}
          className="add-button"
          accessibilityLabel="Add new entry"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={32} color={theme.colors.primary.contrast} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  headerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    textAlign: 'center',
    color: theme.colors.text.primary,
  } as TextStyle,
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  } as TextStyle,
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80, // Add space to account for the add button
  } as ViewStyle,
  logo: {
    width: 280,
    height: 280,
  } as ImageStyle,
  addButtonContainer: {
    position: 'absolute',
    bottom: theme.spacing.xxxl,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100, // Ensure it's above other elements
  } as ViewStyle,
  addButton: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  } as ViewStyle,
});
