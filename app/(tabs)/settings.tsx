import React from 'react';
import { StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, ActivityIndicator, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/context/AuthContext';
import theme from '@/app/constants/theme';
import { View, Text } from '@/app/components';
import { errorService } from '@/app/services/ErrorService';

/**
 * Settings Screen Component
 * Displays user profile and application settings
 */
export default function SettingsScreen() {
  // Feature flags - all disabled except sign out
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const { user, logout, isLoading } = useAuth();

  /**
   * Handle logout with confirmation dialog
   */
  const handleLogout = () => {
    try {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: logout,
          },
        ],
        { cancelable: true }
      );
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { action: 'logout_confirmation' }
      });
    }
  };

  /**
   * Handle toggle notifications (disabled)
   */
  const handleToggleNotifications = (value: boolean) => {
    try {
      // Feature disabled - don't update state
      // setNotificationsEnabled(value);
      
      Alert.alert(
        'Feature Unavailable',
        'This feature is currently disabled.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { action: 'toggle_notifications' }
      });
    }
  };

  /**
   * Handle toggle dark mode (disabled)
   */
  const handleToggleDarkMode = (value: boolean) => {
    try {
      // Feature disabled - don't update state
      // setDarkModeEnabled(value);
      
      Alert.alert(
        'Feature Unavailable',
        'This feature is currently disabled.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { action: 'toggle_dark_mode' }
      });
    }
  };

  /**
   * Handle disabled feature selection
   */
  const handleFeatureDisabled = () => {
    try {
      Alert.alert(
        'Feature Unavailable',
        'This feature is currently disabled.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { action: 'feature_disabled' }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Account & Settings</Text>
        
        {/* User profile section */}
        {user && (
          <View style={styles.profileSection}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitials}>
                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
              </Text>
            </View>
            <Text style={styles.profileName}>{user.displayName || 'User'}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text.tertiary} />
              <Text style={styles.settingTextDisabled}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.colors.neutral.medium, true: theme.colors.primary.light }}
                thumbColor={notificationsEnabled ? theme.colors.primary.main : theme.colors.neutral.white}
                disabled={true}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Ionicons name="moon-outline" size={24} color={theme.colors.text.tertiary} />
              <Text style={styles.settingTextDisabled}>Dark Mode</Text>
              <Switch
                value={darkModeEnabled}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: theme.colors.neutral.medium, true: theme.colors.primary.light }}
                thumbColor={darkModeEnabled ? theme.colors.primary.main : theme.colors.neutral.white}
                disabled={true}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.settingRow} 
              onPress={handleFeatureDisabled}
              disabled={true}
            >
              <Ionicons name="person-outline" size={24} color={theme.colors.text.tertiary} />
              <Text style={styles.settingTextDisabled}>Profile</Text>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingRow} 
              onPress={handleLogout}
              disabled={isLoading}
            >
              <Ionicons name="log-out-outline" size={24} color={theme.colors.utility.error} />
              <Text style={{
                ...styles.settingText,
                color: theme.colors.utility.error
              }}>
                {isLoading ? 'Signing Out...' : 'Sign Out'}
              </Text>
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.utility.error} />
              ) : (
                <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleFeatureDisabled}
              disabled={true}
            >
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.text.tertiary} />
              <Text style={styles.settingTextDisabled}>About Armatillo</Text>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleFeatureDisabled} 
              disabled={true}
            >
              <Ionicons name="document-text-outline" size={24} color={theme.colors.text.tertiary} />
              <Text style={styles.settingTextDisabled}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
  } as ViewStyle,
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    color: theme.colors.text.primary,
  } as TextStyle,
  profileSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.circle,
    marginBottom: theme.spacing.md,
  } as ImageStyle,
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  profileInitials: {
    fontSize: theme.typography.fontSize.xxxl,
    color: theme.colors.primary.contrast,
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle,
  profileName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.primary,
  } as TextStyle,
  profileEmail: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  } as TextStyle,
  section: {
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
    color: theme.colors.text.primary,
  } as TextStyle,
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.sm
  } as ViewStyle,
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  } as ViewStyle,
  settingText: {
    fontSize: theme.typography.fontSize.md,
    flex: 1,
    marginLeft: theme.spacing.lg,
    color: theme.colors.text.primary,
  } as TextStyle,
  settingTextDisabled: {
    fontSize: theme.typography.fontSize.md,
    flex: 1,
    marginLeft: theme.spacing.lg,
    color: theme.colors.text.tertiary,
  } as TextStyle,
});