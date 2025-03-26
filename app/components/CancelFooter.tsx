import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../constants/theme';

interface CancelFooterProps {
  onCancel?: () => void; // Optional callback for additional actions on cancel
}

export default function CancelFooter({ onCancel }: CancelFooterProps) {
  const router = useRouter();

  const handleCancel = () => {
    // If custom onCancel provided, execute it
    if (onCancel) {
      onCancel();
    }
    
    // Navigate to home - the tabs root
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={handleCancel}
      >
        <Ionicons name="close-circle-outline" size={20} color={theme.colors.utility.error} />
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
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.utility.error,
  },
  cancelButtonText: {
    color: theme.colors.utility.error,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
});
