import React from 'react';
import { StyleSheet, ScrollView, ViewStyle, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OptionItem } from '@/app/constants/optionDictionaries';
import theme from '@/app/constants/theme';
import EmojiPill from './EmojiPill';
import { errorService } from '@/app/services/ErrorService';

interface EmojiPillRowProps {
  items: OptionItem[];
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  onPressAdd?: () => void;
  horizontal?: boolean;
  disabled?: boolean;
}

/**
 * Component for displaying a scrollable row of emoji pills
 */
export default function EmojiPillRow({
  items,
  selectedIds,
  onToggleItem,
  onPressAdd,
  horizontal = true,
  disabled = false,
}: EmojiPillRowProps) {
  /**
   * Handle item toggle with error handling
   */
  const handleToggle = (id: string) => {
    try {
      if (!disabled) {
        onToggleItem(id);
      }
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'EmojiPillRow', 
          action: 'toggleItem',
          itemId: id
        }
      });
    }
  };

  /**
   * Handle add button press with error handling
   */
  const handleAddPress = () => {
    try {
      if (onPressAdd) {
        onPressAdd();
      }
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'EmojiPillRow', 
          action: 'pressAdd',
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={horizontal ? styles.rowContainer : styles.columnContainer}
      >
        {items.map((item) => (
          <EmojiPill
            key={item.id}
            id={item.id}
            label={item.label}
            emoji={item.emoji}
            selected={selectedIds.includes(item.id)}
            onToggle={handleToggle}
            disabled={disabled}
          />
        ))}
      </ScrollView>
      
      {onPressAdd && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Add more options"
          accessibilityHint="Opens a modal to add more options"
        >
          <Ionicons
            name="add-circle"
            size={24}
            color={disabled ? theme.colors.utility.disabled : theme.colors.primary.main}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  } as ViewStyle,
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.lg, // Extra space for the add button
  } as ViewStyle,
  columnContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: theme.spacing.sm,
  } as ViewStyle,
  addButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  } as ViewStyle,
});