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
            
            // Add styles to fix the white space below tabs
            const style = document.createElement('style');
            style.innerHTML = `
              /* Override any existing bottom margins or paddings */
              [role="tablist"] {
                bottom: 0 !important;
                margin-bottom: 0 !important;
                border-bottom: none !important;
                padding-bottom: env(safe-area-inset-bottom, 0px) !important;
                height: auto !important;
                min-height: 49px !important;
                max-height: calc(49px + env(safe-area-inset-bottom, 0px)) !important;
              }
              
              /* Target React Navigation specific elements */
              .css-view-175oi2r.r-backgroundColor-8jlm1c,
              .r-bottom-1p0dtai {
                bottom: 0 !important;
                margin-bottom: 0 !important;
                height: auto !important;
              }
              
              /* Fix parent container heights */
              body, #root, main {
                min-height: 100vh !important;
                height: 100% !important;
                max-height: -webkit-fill-available !important;
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
              }
              
              /* Eliminate any possible whitespace */
              .pwa-standalone nav,
              .pwa-standalone footer {
                margin-bottom: 0 !important;
                padding-bottom: env(safe-area-inset-bottom, 0px) !important;
                bottom: 0 !important;
                position: fixed !important;
              }
            `;
            document.head.appendChild(style);
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
        marginBottom: 0,
        height: 'auto',
        minHeight: 49,
        maxHeight: 'calc(49px + env(safe-area-inset-bottom, 0px))',
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
          // Important: Control the height to reduce extra space
          tabBarItemStyle: isPwa ? { 
            paddingBottom: 0,
            marginBottom: 0,
          } : {},
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
    marginBottom: 0, // Reduce bottom margin to minimize extra space
    paddingBottom: 0, // Reduce padding to minimize extra space
  },
});
