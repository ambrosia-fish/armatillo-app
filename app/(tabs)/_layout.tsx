import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import theme from '@/app/constants/theme';
import { useColorScheme } from '@/app/hooks/useColorScheme';
import { AuthGuard } from '@/app/components';
import { isInStandaloneMode } from '@/app/utils/pwaUtils';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isPwa, setIsPwa] = useState(false);
  
  // Detect if the app is running as a PWA
  useEffect(() => {
    if (Platform.OS === 'web') {
      const standalone = isInStandaloneMode();
      setIsPwa(standalone);
      
      // Add a class to the tab bar for PWA styling if needed
      if (standalone && typeof document !== 'undefined') {
        // Find the tab bar element after a short delay to ensure it's mounted
        setTimeout(() => {
          const tabBarElement = document.querySelector('[role="tablist"]');
          if (tabBarElement) {
            tabBarElement.classList.add('pwa-tab-bar');
            console.log('Added PWA class to tab bar');
          }
        }, 500);
      }
    }
  }, []);

  // Create tab bar styles with PWA adjustments
  const getTabBarStyle = () => {
    const baseStyle = {
      borderTopColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.primary,
    };
    
    // Add PWA-specific styles if in standalone mode
    if (isPwa && Platform.OS === 'web') {
      return {
        ...baseStyle,
        // Ensure the tab bar is visible by setting z-index and accounting for safe area
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      };
    }
    
    return baseStyle;
  };

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary.main,
          tabBarInactiveTintColor: theme.colors.text.tertiary,
          headerShown: false,
          tabBarStyle: getTabBarStyle(),
          // Add an ID or custom prop for easier styling selection
          tabBarLabelStyle: isPwa ? styles.pwaTabLabel : {},
        }}>
        <Tabs.Screen
          name="progress"
          options={{
            title: 'History',
            tabBarIcon: ({ color, focused }) => 
              <Ionicons 
                name={focused ? 'time' : 'time-outline'} 
                size={24} 
                color={color} 
              />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => 
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={color} 
              />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => 
              <Ionicons 
                name={focused ? 'settings' : 'settings-outline'} 
                size={24} 
                color={color} 
              />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  pwaTabLabel: {
    // Adjust text size for better visibility on iOS
    fontSize: 12,
    marginBottom: 4,
  },
});
