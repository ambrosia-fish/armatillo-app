import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  StatusBar 
} from 'react-native';
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
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: logout },
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
   * Handle feature disabled alert
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
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          {/* Settings Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Account & Settings</Text>

            {/* General Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>General</Text>
              
              <View style={styles.card}>
                {/* Notifications */}
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={handleFeatureDisabled}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="notifications-outline" size={20} color={theme.colors.text.tertiary} />
                  </View>
                  <Text style={styles.settingText}>Notifications</Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleFeatureDisabled}
                    disabled={true}
                    trackColor={{ 
                      false: 'rgba(120, 120, 128, 0.16)', 
                      true: theme.colors.primary.light 
                    }}
                    thumbColor={theme.colors.neutral.white}
                  />
                </TouchableOpacity>
                
                {/* Dark Mode */}
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={handleFeatureDisabled}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="moon-outline" size={20} color={theme.colors.text.tertiary} />
                  </View>
                  <Text style={styles.settingText}>Dark Mode</Text>
                  <Switch
                    value={darkModeEnabled}
                    onValueChange={handleFeatureDisabled}
                    disabled={true}
                    trackColor={{ 
                      false: 'rgba(120, 120, 128, 0.16)', 
                      true: theme.colors.primary.light 
                    }}
                    thumbColor={theme.colors.neutral.white}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              
              <View style={styles.card}>
                {/* Profile */}
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={handleFeatureDisabled}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="person-outline" size={20} color={theme.colors.text.tertiary} />
                  </View>
                  <Text style={styles.settingText}>Profile</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
                
                {/* Sign Out */}
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={handleLogout}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, styles.logoutIcon]}>
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.utility.error} />
                  </View>
                  <Text style={styles.logoutText}>
                    {isLoading ? 'Signing Out...' : 'Sign Out'}
                  </Text>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.utility.error} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              
              <View style={styles.card}>
                {/* About Armatillo */}
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={handleFeatureDisabled}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.text.tertiary} />
                  </View>
                  <Text style={styles.settingText}>About Armatillo</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
                
                {/* Privacy Policy */}
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={handleFeatureDisabled}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="document-text-outline" size={20} color={theme.colors.text.tertiary} />
                  </View>
                  <Text style={styles.settingText}>Privacy Policy</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
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
  
  settingText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  } as TextStyle,
  
  logoutText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.utility.error,
  } as TextStyle,
});