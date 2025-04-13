import { StyleSheet, ViewStyle, TextStyle, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text, View, Button } from '../../components';
import theme from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { clearAuthTokens } from '../../utils/tokenUtils';
import ModalComponent from './modal';

interface ApprovalPendingModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal to inform users that their account is pending approval
 */
export default function ApprovalPendingModal({
  visible,
  onClose
}: ApprovalPendingModalProps) {
  // const { logout } = useAuth();
  const router = useRouter();

  const handleContactRequest = () => {
    Linking.openURL('mailto:josef@feztech.io?subject=Armatillo%20App%20Access%20Request');
  };

  // Simplified handler that uses the auth context's logout
  // This ensures the auth state is properly updated throughout the app
  const handleGoBack = async () => {
    try {
      // Use the AuthContext logout which will:
      // 1. Update the auth state (LOGGING_OUT → UNAUTHENTICATED)
      // 2. Clear tokens
      // 3. The redirect prop in _layout.tsx will handle navigation back to login
      // await logout();
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('ApprovalPendingModal: Error going back', error);
      
      // Fallback if logout fails
      await clearAuthTokens();
      router.replace('/screens/auth/login');
      onClose();
    }
  };

  const modalFooter = (
    <View style={styles.footerContainer}>
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
  );

  return (
    <ModalComponent
      visible={visible}
      title="Account Pending Approval"
      onClose={onClose}
      footer={modalFooter}
      contentStyle={styles.content}
    >
      <View style={styles.contentContainer}>
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
      </View>
    </ModalComponent>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.xl,
  } as ViewStyle,
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  footerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  } as ViewStyle,
  contactButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    width: '100%',
  } as ViewStyle,
  backButton: {
    marginBottom: theme.spacing.md,
    width: '100%',
  } as ViewStyle,
});