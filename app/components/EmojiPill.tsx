import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { View, Text } from './Themed';
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';

interface EmojiPillProps {
  id: string;
  label: string;
  emoji: string;
  selected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

/**
 * Pill-shaped component for toggling emoji selections
 */
export default function EmojiPill({
  id,
  label,
  emoji,
  selected,
  onToggle,
  disabled = false,
}: EmojiPillProps) {
  /**
   * Handle item selection with error handling
   */
  const handleToggle = () => {
    try {
      if (!disabled) {
        onToggle(id);
      }
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'EmojiPill', 
          action: 'toggleItem',
          itemId: id
        }
      });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        selected && styles.selectedPill,
        disabled && styles.disabledPill,
      ]}
      onPress={handleToggle}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${selected ? 'selected' : 'unselected'}`}
      accessibilityState={{ selected, disabled }}
      accessibilityHint={`Tap to ${selected ? 'unselect' : 'select'} ${label}`}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text
        style={[
          styles.label,
          selected && styles.selectedLabel,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: 20, // Pill shape
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  } as ViewStyle,
  selectedPill: {
    backgroundColor: theme.colors.primary.light + '30', // 30% opacity
    borderColor: theme.colors.primary.main,
  } as ViewStyle,
  disabledPill: {
    backgroundColor: theme.colors.neutral.lighter,
    borderColor: theme.colors.border.light,
    opacity: 0.5,
  } as ViewStyle,
  emoji: {
    fontSize: theme.typography.fontSize.md,
    marginRight: theme.spacing.xs,
  } as TextStyle,
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  } as TextStyle,
  selectedLabel: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
  disabledLabel: {
    color: theme.colors.text.disabled,
  } as TextStyle,
});