import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/app/styles/theme';
import { OptionItem } from '@/app/constants/options';
import EmojiPill from './EmojiPill';

type CategoryType = 'location' | 'activity' | 'emotion' | 'thought' | 'sensation';

interface CategoryPillsProps {
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

/**
 * Renders a collection of selected category items as pills
 * with the ability to remove them or add new ones
 */
const CategoryPills: React.FC<CategoryPillsProps> = ({
  categoryType,
  selectedItems,
  options,
  onToggleItem,
  onOpenModal
}) => {
  // Get the display title based on the category type
  const getTitle = () => {
    switch(categoryType) {
      case 'location': return 'Locations';
      case 'activity': return 'Activities';
      case 'emotion': return 'Emotions';
      case 'thought': return 'Thought Patterns';
      case 'sensation': return 'Physical Sensations';
      default: return categoryType.charAt(0).toUpperCase() + categoryType.slice(1);
    }
  };

  // Filter options to only show those that are selected
  const selectedOptions = options.filter(option => 
    selectedItems.includes(option.id)
  );

  return (
    <View style={styles.container}>
      <View style={styles.pillsContainer}>
        {selectedOptions.map(option => (
          <EmojiPill
            key={option.id}
            id={option.id}
            label={option.label}
            emoji={option.emoji}
            onToggle={() => onToggleItem(categoryType, option.id)}
            selected={true}
          />
        ))}
        
        {/* Add button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => onOpenModal(
            categoryType,
            `Select ${getTitle()}`,
            options,
            selectedItems
          )}
          accessibilityLabel={`Add more ${getTitle().toLowerCase()}`}
          accessibilityHint={`Opens modal to select more ${getTitle().toLowerCase()}`}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={20} color={theme.colors.primary.main} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  addButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary.light + '30',
    borderColor: theme.colors.primary.main,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
});

export default CategoryPills;