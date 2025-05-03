import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/app/store/contexts/AuthContext';
import theme from '@/app/styles/theme';
import { View, Text } from '@/app/components';
import Header from '@/app/components/Header';

/**
 * Settings Screen Component
 * Displays user profile and application settings
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, isLoading, authState } = useAuth();
  const [logoutRequested, setLogoutRequested] = useState(false);

  // Log auth state for debugging
  useEffect(() => {
    console.log('SettingsScreen: Auth state:', authState);
    console.log('SettingsScreen: User:', user?.displayName, user?.email);
  }, [authState, user]);

  /**
   * Handle logout with confirmation dialog
   */
  const handleLogout = () => {
    if (isLoading || logoutRequested) {
      return; // Prevent multiple logout attempts
    }
    
    const confirmLogout = (confirmed: boolean) => {
      if (confirmed) {
        console.log('SettingsScreen: Initiating logout...');
        setLogoutRequested(true);
        
        // Attempt to logout
        logout()
          .then(() => {
            console.log('SettingsScreen: Logout successful');
            // Navigation is handled at the root level
          })
          .catch(error => {
            console.error('SettingsScreen: Logout error:', error);
            setLogoutRequested(false);
          });
      }
    };
    
    if (Platform.OS === 'web') {
      // For web, use a simpler approach that doesn't rely on Alert
      const confirmed = window.confirm('Are you sure you want to sign out?');
      confirmLogout(confirmed);
    } else {
      // For native platforms, use Alert
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign Out', 
            style: 'destructive', 
            onPress: () => confirmLogout(true) 
          },
        ],
        { cancelable: true }
      );
    }
  };

  /**
   * Navigate back to previous screen
   */
  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.outerContainer}>
      {/* Hide the native header */}
      <Stack.Screen options={{ 
        headerShown: false 
      }} />
      
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <SafeAreaView style={styles.container}>
        <Header 
          title="Settings"
          showBackButton={true}
          onLeftPress={handleBackPress}
        />
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          testID="settings-screen-scroll"
          accessibilityLabel="Settings screen"
        >
          {/* Profile Section */}
          <View 
            style={styles.profileHeader}
            testID="profile-header"
            accessibilityLabel="User profile information"
          >
            <View 
              style={styles.avatar}
              accessibilityLabel={`Avatar for ${user?.displayName || 'User'}`}
            >
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0)?.toUpperCase() || 
                 user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
            <Text 
              style={styles.userEmail}
              accessibilityLabel={`Email: ${user?.email || 'No email available'}`}
            >
              {user?.email}
            </Text>
          </View>

          {/* Settings Content */}
          <View 
            style={styles.content}
            testID="settings-content"
            accessibilityLabel="Settings options"
          >
            <Text style={styles.title}>Account & Settings</Text>

            {/* Account Section */}
            <View 
              style={styles.section}
              testID="account-section"
              accessibilityLabel="Account settings section"
            >
              <Text style={styles.sectionTitle}>Account</Text>
              
              <View style={styles.card}>
                {/* Sign Out */}
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={handleLogout}
                  disabled={isLoading || logoutRequested}
                  activeOpacity={0.7}
                  testID="logout-button"
                  accessibilityLabel="Sign out button"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to sign out of your account"
                  accessibilityState={{ disabled: isLoading || logoutRequested }}
                >
                  <View style={[styles.iconContainer, styles.logoutIcon]}>
                    <Ionicons 
                      name="log-out-outline" 
                      size={20} 
                      color={theme.colors.utility.error} 
                    />
                  </View>
                  <Text 
                    style={styles.logoutText}
                    accessibilityLabel={isLoading || logoutRequested ? "Signing out in progress" : "Sign out"}
                  >
                    {isLoading || logoutRequested ? 'Signing Out...' : 'Sign Out'}
                  </Text>
                  {isLoading || logoutRequested ? (
                    <ActivityIndicator 
                      size="small" 
                      color={theme.colors.utility.error}
                      accessibilityLabel="Loading indicator" 
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Version Info */}
              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>
                  Armatillo v0.1.0 (Pre-Alpha)
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxxl,
  } as ViewStyle,
  
  profileHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  } as ViewStyle,
  
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.neutral.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  
  avatarText: {
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.primary.contrast,
  } as TextStyle,
  
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  
  userEmail: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  } as TextStyle,
  
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  } as ViewStyle,
  
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  
  section: {
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  } as TextStyle,
  
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: theme.colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  } as ViewStyle,
  
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  } as ViewStyle,
  
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(72, 82, 131, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  } as ViewStyle,
  
  logoutIcon: {
    backgroundColor: 'rgba(214, 106, 106, 0.1)',
  } as ViewStyle,
  
  logoutText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.utility.error,
  } as TextStyle,
  
  versionContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  } as ViewStyle,
  
  versionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  } as TextStyle,
});