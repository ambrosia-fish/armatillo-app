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
          // Target the tab bar
          const tabBarElement = document.querySelector('[role="tablist"]');
          if (tabBarElement) {
            tabBarElement.classList.add('pwa-tab-bar');
            console.log('Added PWA class to tab bar');
            
            // Add specific fix for white space
            const whiteSpaceFix = document.createElement('style');
            whiteSpaceFix.innerHTML = `
              /* Fix exact height of tab bar */
              [role="tablist"] {
                height: 49px !important;
                min-height: 49px !important;
                max-height: calc(49px + env(safe-area-inset-bottom, 0px)) !important;
                padding-bottom: env(safe-area-inset-bottom, 0px) !important;
                margin-bottom: 0 !important;
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
              }
              
              /* Target React Navigation specific elements */
              .css-view-175oi2r.r-backgroundColor-8jlm1c {
                height: calc(49px + env(safe-area-inset-bottom, 0px)) !important;
                bottom: 0 !important;
                position: fixed !important;
                left: 0 !important;
                right: 0 !important;
                padding-bottom: env(safe-area-inset-bottom, 0px) !important;
                margin-bottom: 0 !important;
                z-index: 1000 !important;
              }
              
              /* Fill the bottom area with white color to eliminate the white bar */
              body::after {
                content: "";
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: env(safe-area-inset-bottom, 0px);
                background-color: #ffffff;
                z-index: 999;
              }
              
              /* Fix container heights */
              body, html {
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden;
              }
              
              #root {
                height: 100% !important;
                padding-bottom: 0 !important;
                margin-bottom: 0 !important;
              }
              
              /* Make tab items show fully */
              [role="tab"] {
                height: 49px !important;
                min-height: 49px !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                align-items: center !important;
              }
            `;
            document.head.appendChild(whiteSpaceFix);
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
        // Set exact height for the tab bar
        height: 49,
        minHeight: 49,
        maxHeight: 'calc(49px + env(safe-area-inset-bottom, 0px))',
        // Ensure the tab bar is visible with fixed position
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        marginBottom: 0,
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
            height: 49,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
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
