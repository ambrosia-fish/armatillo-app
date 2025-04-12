import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform, View } from 'react-native';
import theme from '@/app/constants/theme';

/**
 * Tab layout for main app navigation
 * Authentication is handled at the root level
 */
export default function TabLayout() {
  // Apply specific fix for web platform to ensure tabs render correctly with mobile browser bars
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Fix for mobile browser navigation bars
      const injectCSS = () => {
        const style = document.createElement('style');
        style.textContent = `
          /* Fix for mobile browser navigation bars */
          @supports (padding: env(safe-area-inset-bottom)) {
            .r-bottom-1nlznpj {
              bottom: env(safe-area-inset-bottom) !important;
            }
            
            nav {
              padding-bottom: env(safe-area-inset-bottom);
            }
            
            /* Add margin to the main content area */
            #root > div > div {
              margin-bottom: 60px;
            }
          }
        `;
        document.head.appendChild(style);
      };
      
      // Run immediately and also after a short delay to ensure DOM is fully loaded
      injectCSS();
      setTimeout(injectCSS, 1000);
    }
  }, []);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}>
      
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => 
            <Ionicons 
              name={focused ? 'time' : 'time-outline'} 
              size={24} 
              color={color} 
              accessibilityLabel="Progress tab"
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
              accessibilityLabel="Home tab"
            />,
        }}
      />

      {/* Settings tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => 
            <Ionicons 
              name={focused ? 'settings' : 'settings-outline'} 
              size={24} 
              color={color} 
              accessibilityLabel="Settings tab"
            />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
    // Add elevation for Android
    elevation: 4,
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Ensure tab bar works correctly on all platforms
    height: Platform.OS === 'web' ? 60 : undefined,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabLabel: {
    fontSize: 12,
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
  },
  tabItem: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
  }
});
