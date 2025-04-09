import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import theme from '@/app/constants/theme';
import { useAuth } from '@/app/context/AuthContext';
import RouteGuard from '@/app/components/RouteGuard';

/**
 * Tab layout component for the main authenticated tabs
 * Protected by RouteGuard to ensure only authenticated users can access
 */
export default function TabLayout() {
  const { isAuthenticated, authState } = useAuth();
  
  // Log for debugging
  useEffect(() => {
    console.log('TabLayout mounted, auth state:', authState);
  }, [authState]);

  return (
    <RouteGuard>
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
    </RouteGuard>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  tabLabel: {
    fontSize: 12,
  },
  tabItem: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
});