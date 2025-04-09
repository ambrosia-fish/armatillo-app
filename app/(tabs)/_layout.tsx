import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import theme from '@/app/constants/theme';

/**
 * Tab layout for main app navigation
 * Authentication is handled at the root level
 */
export default function TabLayout() {
  const router = useRouter();
  
  // When the tab layout mounts, navigate to the index tab
  useEffect(() => {
    // Short delay to ensure tabs are fully mounted
    const timer = setTimeout(() => {
      console.log('TabLayout: Navigating to home tab');
      router.replace('/(tabs)/index');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}>
      {/* Progress tab (left position) */}
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
      
      {/* Home tab (middle position) */}
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
      
      {/* Settings tab (right position) */}
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