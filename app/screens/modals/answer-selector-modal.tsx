import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OptionItem } from '@/app/constants/optionDictionaries';
import theme from '@/app/constants/theme';
import EmojiPill from '../../components/EmojiPill';
import { errorService } from '@/app/services/ErrorService';
import ModalComponent from '@/app/screens/modals/modal';

interface AnswerSelectorModalProps {
  visible: boolean;
  title: string;
  options: OptionItem[];
  selectedIds: string[];
  onSelect: (selectedIds: string[]) => void;
  onClose: () => void;
  allowMultiple?: boolean;
  allowCustom?: boolean;
}

/**
 * Modal component for selecting options from a predefined list
 */
export default function AnswerSelectorModal({
  visible,
  title,
  options,
  selectedIds,
  onSelect,
  onClose,
  allowMultiple = true,
  allowCustom = false,
}: AnswerSelectorModalProps) {
  // Local state to track selections before applying them
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [customOption, setCustomOption] = useState('');

  /**
   * Reset the modal state when it's opened or closed
   */
  React.useEffect(() => {
    if (visible) {
      setLocalSelectedIds(selectedIds);
      setSearchQuery('');
      setCustomOption('');
    }
  }, [visible, selectedIds]);

  /**
   * Toggle selection of an item
   */
  const handleToggle = (id: string) => {
    try {
      if (allowMultiple) {
        // Toggle selection (add or remove)
        setLocalSelectedIds(prev => 
          prev.includes(id) 
            ? prev.filter(itemId => itemId !== id) 
            : [...prev, id]
        );
      } else {
        // Single selection mode - replace any existing selection
        setLocalSelectedIds([id]);
      }
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'AnswerSelectorModal', 
          action: 'toggleItem',
          itemId: id
        }
      });
    }
  };

  /**
   * Apply the selected options and close the modal
   */
  const handleApply = () => {
    try {
      onSelect(localSelectedIds);
      onClose();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'AnswerSelectorModal', 
          action: 'applySelection',
        }
      });
    }
  };

  /**
   * Add a custom option
   */
  const handleAddCustom = () => {
    try {
      if (customOption.trim() === '') return;
      
      // Create a custom ID based on the text
      const customId = `custom_${customOption.toLowerCase().replace(/\s+/g, '_')}`;
      
      // Check if this custom option already exists
      const existingOption = options.find(opt => 
        opt.id === customId || opt.label.toLowerCase() === customOption.toLowerCase()
      );
      
      if (existingOption) {
        // If it exists, just select it
        if (!localSelectedIds.includes(existingOption.id)) {
          if (allowMultiple) {
            setLocalSelectedIds(prev => [...prev, existingOption.id]);
          } else {
            setLocalSelectedIds([existingOption.id]);
          }
        }
      } else {
        // TODO: In a full implementation, we would add this to the database/state
        // and update our options. For now, we'll just select it locally.
        
        // For now, just select the custom ID
        if (allowMultiple) {
          setLocalSelectedIds(prev => [...prev, customId]);
        } else {
          setLocalSelectedIds([customId]);
        }
      }
      
      // Clear the input
      setCustomOption('');
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'AnswerSelectorModal', 
          action: 'addCustomOption',
        }
      });
    }
  };

  /**
   * Filter options based on search query
   */
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Modal footer with action buttons
  const modalFooter = (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.cancelButton]}
        onPress={onClose}
        accessibilityLabel="Cancel"
        accessibilityRole="button"
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.applyButton]}
        onPress={handleApply}
        accessibilityLabel="Apply"
        accessibilityRole="button"
      >
        <Text style={styles.applyButtonText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ModalComponent
      visible={visible}
      title={title}
      onClose={onClose}
      footer={modalFooter}
      contentStyle={styles.modalContent}
    >
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color={theme.colors.text.tertiary} 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search options..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.text.tertiary}
          returnKeyType="search"
          accessibilityLabel="Search options"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
            accessibilityLabel="Clear search"
          >
            <Ionicons 
              name="close-circle" 
              size={18} 
              color={theme.colors.text.tertiary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Custom Option Input */}
      {allowCustom && (
        <View style={styles.customContainer}>
          <TextInput
            style={styles.customInput}
            placeholder="Add a custom option..."
            value={customOption}
            onChangeText={setCustomOption}
            placeholderTextColor={theme.colors.text.tertiary}
            returnKeyType="done"
            onSubmitEditing={handleAddCustom}
            accessibilityLabel="Add custom option"
          />
          <TouchableOpacity 
            onPress={handleAddCustom}
            style={styles.addButton}
            disabled={!customOption.trim()}
            accessibilityLabel="Add custom option button"
          >
            <Ionicons 
              name="add-circle" 
              size={24} 
              color={
                customOption.trim() 
                  ? theme.colors.primary.main 
                  : theme.colors.utility.disabled
              } 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Options List */}
      <ScrollView style={styles.optionsContainer}>
        <View style={styles.optionsGrid}>
          {filteredOptions.map((option) => (
            <EmojiPill
              key={option.id}
              id={option.id}
              label={option.label}
              emoji={option.emoji}
              selected={localSelectedIds.includes(option.id)}
              onToggle={handleToggle}
            />
          ))}
        </View>

        {filteredOptions.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Ionicons 
              name="search-outline" 
              size={48} 
              color={theme.colors.text.tertiary} 
            />
            <Text style={styles.emptyStateText}>
              No matching options found
            </Text>
          </View>
        )}
      </ScrollView>
    </ModalComponent>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: 0,
  } as ViewStyle,
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  } as ViewStyle,
  
  searchIcon: {
    marginRight: theme.spacing.sm,
  } as ViewStyle,
  
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  clearButton: {
    padding: theme.spacing.xs,
  } as ViewStyle,
  
  customContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  } as ViewStyle,
  
  customInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  addButton: {
    padding: theme.spacing.xs,
  } as ViewStyle,
  
  optionsContainer: {
    marginHorizontal: theme.spacing.lg,
    maxHeight: 300,
  } as ViewStyle,
  
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: theme.spacing.lg,
  } as ViewStyle,
  
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.huge,
  } as ViewStyle,
  
  emptyStateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.md,
  } as TextStyle,
  
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  } as ViewStyle,
  
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    marginHorizontal: theme.spacing.xs,
  } as ViewStyle,
  
  cancelButton: {
    backgroundColor: theme.colors.neutral.lighter,
  } as ViewStyle,
  
  cancelButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
  } as TextStyle,
  
  applyButton: {
    backgroundColor: theme.colors.primary.main,
  } as ViewStyle,
  
  applyButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.primary.contrast,
  } as TextStyle,
});