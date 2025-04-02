import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '@/app/constants/theme';

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
    <View 
      style={getFooterStyle()}
      className="cancel-footer bottom-area"
    >
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
    // Ensure button is accessible in PWA mode
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
