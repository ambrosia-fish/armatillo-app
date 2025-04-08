import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, Linking } from 'react-native';
import { useRouter, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, View, Button } from '../../components';
import theme from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function ApprovalPendingModal() {
  const insets = useSafeAreaInsets();
  const { clearApprovalStatus } = useAuth();

  const handleContactRequest = () => {
    Linking.openURL('mailto:josef@feztech.io?subject=Armatillo%20App%20Access%20Request');
  };

  const handleGoBack = async () => {
    try {
      // Use the new method from AuthContext that ensures state and storage are in sync
      await clearApprovalStatus();
      
      // Use direct navigation with global router
      router.replace('/screens/auth/login');
    } catch (error) {
      // Fallback navigation as a last resort
      router.replace('/screens/auth/login');
    }
  };

  return (
    <View style={[
      styles.container,
      { 
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, theme.spacing.md) 
      }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Account Pending Approval</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Ionicons 
          name="time-outline" 
          size={80} 
          color={theme.colors.primary.main}
          style={styles.icon}
        />
        
        <Text style={styles.heading}>Thank You for Your Interest!</Text>
        
        <Text style={styles.text}>
          Your account has been created successfully, but requires approval before you can access the application.
        </Text>
        
        <Text style={styles.text}>
          Armatillo is currently in pre-alpha and testing is only available to certain users. Please contact us if you would like to participate in testing.
        </Text>
        
        <Button 
          title="Contact for Testing Access" 
          onPress={handleContactRequest}
          size="large"
          style={styles.contactButton}
        />
        
        <Button 
          title="Go Back" 
          onPress={handleGoBack}
          variant="secondary"
          size="medium"
          style={styles.backButton}
        />
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  closeButton: {
    padding: theme.spacing.sm,
  } as ViewStyle,
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.primary.main,
  } as TextStyle,
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing.xl,
  } as ViewStyle,
  icon: {
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  heading: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
  } as TextStyle,
  text: {
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
    color: theme.colors.text.secondary,
  } as TextStyle,
  contactButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    width: '100%',
  } as ViewStyle,
  backButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    width: '100%',
  } as ViewStyle,
});