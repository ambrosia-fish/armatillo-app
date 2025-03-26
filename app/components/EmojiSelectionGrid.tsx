import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OptionItem } from '../constants/optionDictionaries';
import theme from '../constants/theme';

interface EmojiSelectionGridProps {
  options: OptionItem[];
  selectedItems: string[];
  onSelect: (id: string) => void;
  multiSelect?: boolean;
}

export default function EmojiSelectionGrid({
  options,
  selectedItems,
  onSelect,
  multiSelect = true,
}: EmojiSelectionGridProps) {

  const handleSelection = (id: string) => {
    onSelect(id);
  };

  return (
    <View style={styles.grid}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.gridItem,
            selectedItems.includes(option.id) && styles.selectedItem,
          ]}
          onPress={() => handleSelection(option.id)}
        >
          <Text style={styles.emoji}>{option.emoji}</Text>
          <Text
            style={[
              styles.label,
              selectedItems.includes(option.id) && styles.selectedLabel,
            ]}
          >
            {option.label}
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
  },
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
  },
  selectedItem: {
    borderColor: theme.colors.primary.main,
    borderWidth: 1,
  },
  emoji: {
    fontSize: theme.typography.fontSize.xxl,
    marginBottom: theme.spacing.xs,
  },
  label: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  selectedLabel: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
});
