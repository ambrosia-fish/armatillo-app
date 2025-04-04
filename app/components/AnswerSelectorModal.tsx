import React, { useState } from 'react';
import { 
  StyleSheet, 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  TouchableWithoutFeedback,
  SafeAreaView,
  TextInput,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OptionItem } from '@/app/constants/optionDictionaries';
import theme from '@/app/constants/theme';
import EmojiPill from './EmojiPill';
import { errorService } from '@/app/services/ErrorService';

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
   * Cancel selection and close the modal
   */
  const handleCancel = () => {
    try {
      onClose();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { 
          component: 'AnswerSelectorModal', 
          action: 'cancelSelection',
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={handleCancel}>
                  <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>

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
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
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
                  />
                  <TouchableOpacity 
                    onPress={handleAddCustom}
                    style={styles.addButton}
                    disabled={!customOption.trim()}
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

              {/* Action Buttons */}
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.applyButton]}
                  onPress={handleApply}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  customContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  customInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  addButton: {
    padding: theme.spacing.xs,
  },
  optionsContainer: {
    marginHorizontal: theme.spacing.lg,
    maxHeight: 400,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: theme.spacing.lg,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.huge,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.md,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  actionButton: {
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.neutral.lighter,
    marginRight: theme.spacing.md,
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  applyButton: {
    backgroundColor: theme.colors.primary.main,
  },
  applyButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary.contrast,
  },
});
