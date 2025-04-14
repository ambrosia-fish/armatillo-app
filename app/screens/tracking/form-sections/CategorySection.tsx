import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@/app/constants/theme';
import { CategoryPills } from '@/app/components';
import { OptionItem } from '@/app/constants/optionDictionaries';

type CategoryType = 'location' | 'activity' | 'emotion' | 'thought' | 'sensation';

interface CategorySectionProps {
  title: string;
  categoryType: CategoryType;
  selectedItems: string[];
  options: OptionItem[];
  onToggleItem: (category: CategoryType, id: string) => void;
  onOpenModal: (
    type: CategoryType, 
    title: string, 
    options: OptionItem[], 
    selectedIds: string[]
  ) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  title, 
  categoryType, 
  selectedItems, 
  options, 
  onToggleItem, 
  onOpenModal
}) => {
  return (
    <View style={styles.formSection}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      
      <View style={styles.selectionContainer}>
        {selectedItems.length > 0 ? (
          <CategoryPills
            categoryType={categoryType}
            selectedItems={selectedItems}
            options={options}
            onToggleItem={onToggleItem}
            onOpenModal={onOpenModal}
          />
        ) : (
          <TouchableOpacity
            onPress={() => onOpenModal(
              categoryType,
              `Select ${title}`,
              options,
              selectedItems
            )}
            style={styles.bigAddButton}
            accessibilityLabel={`Add ${title.toLowerCase()}`}
            accessibilityHint={`Opens modal to select ${title.toLowerCase()}`}
            accessibilityRole="button"
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    position: 'relative',
    width: '100%',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  selectionContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    minHeight: 45, // Minimum height to fit at least one pill
  },
  bigAddButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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

export default CategorySection;