import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';

// Type for Ionicons names
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface CancelFooterProps {
  onCancel?: () => void; // Optional callback for additional actions on cancel
}

/**
 * Footer component with cancel button for tracking flows
 * 
 * @param props - Component properties
 * @returns Rendered footer with cancel button
 */
export default function CancelFooter({ onCancel }: CancelFooterProps) {
  const router = useRouter();

  /**
   * Handles cancel action with error handling
   */
  const handleCancel = () => {
    try {
      // If custom onCancel provided, execute it
      if (onCancel) {
        onCancel();
      }
      
      // Navigate to home - the tabs root
      router.replace('/(tabs)');
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { component: 'CancelFooter', action: 'cancel' }
      });
    }
  };

  return (
    <View 
      style={styles.footer}
      className="cancel-footer bottom-area"
    >
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={handleCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancel tracking"
        accessibilityHint="Cancels the current tracking session and returns to the home screen"
      >
        <Ionicons 
          name="close-circle-outline" 
          size={20} 
          color={theme.colors.utility.error} 
        />
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    // Ensure button is accessible
    minHeight: 64,
  } as ViewStyle,
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.utility.error,
    // Ensure this meets minimum touch target size
    minHeight: 44,
  } as ViewStyle,
  cancelButtonText: {
    color: theme.colors.utility.error,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    marginLeft: theme.spacing.xs,
  } as TextStyle,
});