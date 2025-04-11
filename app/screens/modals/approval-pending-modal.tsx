import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, View, Button } from '../../components';
import theme from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { clearAuthTokens } from '../../utils/tokenUtils';

export default function ApprovalPendingModal() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleContactRequest = () => {
    Linking.openURL('mailto:josef@feztech.io?subject=Armatillo%20App%20Access%20Request');
  };

  const handleGoBack = async () => {
    try {
      // Skip server logout and just clear tokens locally
      await clearAuthTokens();
      
      // Wait a moment before navigating
      setTimeout(() => {
        router.replace('/screens/auth/login');
      }, 300);
    } catch (error) {
      console.error('ApprovalPendingModal: Error going back', error);
      // Fallback navigation as a last resort
      setTimeout(() => {
        router.replace('/screens/auth/login');
      }, 300);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
      
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
    </SafeAreaView>
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