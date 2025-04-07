import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import theme from '@/app/constants/theme';
import { OptionItem } from '@/app/constants/optionDictionaries';

interface CategoryPillsProps {
  categoryType: string;
  selectedItems: string[];
  options: OptionItem[];
  onToggleItem: (categoryType: string, id: string) => void;
  onOpenModal: (
    type: string, 
    title: string, 
    options: OptionItem[], 
    selectedIds: string[]
  ) => void;
}

export default function CategoryPills({
  categoryType,
  selectedItems,
  options,
  onToggleItem,
  onOpenModal
}: CategoryPillsProps) {
  // Get the selected items with their full data
  const selectedItemsData = selectedItems.map(itemId => {
    return options.find(opt => opt.id === itemId);
  }).filter(Boolean); // Remove any undefined items
  
  // Sort items by label length (longest to shortest)
  const sortedItems = [...selectedItemsData].sort((a, b) => 
    b.label.length - a.label.length
  );
  
  return (
    <View style={styles.pillsFlexContainer}>
      {sortedItems.map((item) => (
        <View key={item.id} style={styles.pillWrapper}>
          <TouchableOpacity
            style={[
              styles.pill,
              styles.pillSelected
            ]}
            onPress={() => onToggleItem(categoryType, item.id)}
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{ selected: true }}
          >
            <Text style={styles.pillEmoji}>{item.emoji}</Text>
            <Text style={[styles.pillText, styles.pillTextSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
      
      {/* Add button inline with pills */}
      <TouchableOpacity
        onPress={() => onOpenModal(
          categoryType,
          `Select ${categoryType.charAt(0).toUpperCase() + categoryType.slice(1)}s`,
          options,
          selectedItems
        )}
        style={styles.inlinePlusButton}
        accessibilityLabel={`Add ${categoryType}s`}
        accessibilityHint={`Opens modal to select ${categoryType}s`}
        accessibilityRole="button"
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pillsFlexContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
    minHeight: 50, // Min height of a single pill row
  },
  pillWrapper: {
    margin: theme.spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: 20,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  pillSelected: {
    backgroundColor: theme.colors.primary.light + '40',
    borderColor: theme.colors.primary.main,
  },
  pillEmoji: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  pillText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  pillTextSelected: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.bold,
  },
  inlinePlusButton: {
    height: 40, // Match the height of pills
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: theme.spacing.xs,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral.lighter,
    borderColor: theme.colors.border.light,
  },
  addButtonText: {
    fontSize: 24,
    color: theme.colors.primary.main,
    textAlign: 'center',
    lineHeight: 24,
  },
});