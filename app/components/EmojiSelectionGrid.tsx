import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { OptionItem } from '@/app/constants/optionDictionaries';
import theme from '@/app/constants/theme';
import { View, Text } from './Themed';

interface EmojiSelectionGridProps {
  items: OptionItem[];
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  numColumns?: number;
}

export default function EmojiSelectionGrid({
  items,
  selectedIds,
  onToggleItem,
  numColumns = 3,
}: EmojiSelectionGridProps) {

  const handleSelection = (id: string) => {
    onToggleItem(id);
  };

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.gridItem,
            selectedIds.includes(item.id) && styles.selectedItem,
          ]}
          onPress={() => handleSelection(item.id)}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text
            style={[
              styles.label,
              selectedIds.includes(item.id) && styles.selectedLabel,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
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
