import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import theme from '@/app/constants/theme';

/**
 * Tab layout for main app navigation
 * Authentication is handled at the root level
 */
export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'web' ? 60: 70, // Explicitly taller for web
          // paddingBottom: Platform.OS === 'web' ? 'env(safe-area-inset-bottom, 30px)' : ,
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
        tabBarLabelPosition: 'below-icon', // Explicitly set position
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: 2, // Leave space for label
        },
        tabBarClassName: "tab-bar-container",
      }}>
      
      
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => 
            <Ionicons 
              name={focused ? 'time' : 'time-outline'} 
              size={24} 
              color={color} 
              accessibilityLabel="Insights tab"
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
