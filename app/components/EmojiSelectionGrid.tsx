import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { OptionItem } from '@/app/constants/optionDictionaries';
import theme from '@/app/constants/theme';
import { View, Text } from './Themed';
import { errorService } from '@/app/services/ErrorService';

interface EmojiSelectionGridProps {
  items: OptionItem[];
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  numColumns?: number;
}

/**
 * Grid component for selecting emoji options
 * 
 * @param props - Component properties
 * @returns Rendered grid of selectable emoji options
 */
export default function EmojiSelectionGrid({
  items,
  selectedIds,
  onToggleItem,
  numColumns = 3,
}: EmojiSelectionGridProps) {

  /**
   * Handle item selection with error handling
   * 
   * @param id - ID of the selected item
   */
  const handleSelection = (id: string) => {
    try {
      onToggleItem(id);
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'EmojiSelectionGrid', 
          action: 'toggleItem',
          itemId: id
        }
      });
    }
  };

  /**
   * Determine if an item is selected
   * 
   * @param id - ID to check
   * @returns Whether the item is selected
   */
  const isSelected = (id: string): boolean => {
    return selectedIds.includes(id);
  };

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const selected = isSelected(item.id);
        
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.gridItem,
              selected && styles.selectedItem,
            ]}
            onPress={() => handleSelection(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`${item.label} ${selected ? 'selected' : 'unselected'}`}
            accessibilityState={{ selected }}
            accessibilityHint={`Tap to ${selected ? 'unselect' : 'select'} ${item.label}`}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text
              style={{
                ...styles.label,
                ...(selected ? styles.selectedLabel : {})
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  } as ViewStyle,
  gridItem: {
    width: '31%',
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  selectedItem: {
    borderColor: theme.colors.primary.main,
    borderWidth: 1,
  } as ViewStyle,
  emoji: {
    fontSize: theme.typography.fontSize.xxl,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  label: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  } as TextStyle,
  selectedLabel: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,
});