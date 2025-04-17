import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './modal';
import { View, Text, Button } from '@/app/components';
import theme from '@/app/constants/theme';
import { Strategy } from '@/app/components/StrategyCard';

interface StrategyModalProps {
  visible: boolean;
  strategy?: Strategy;
  onClose: () => void;
  onSave: (strategy: Partial<Strategy>) => void;
}

/**
 * StrategyModal Component
 * Modal for viewing, creating and editing strategies
 */
const StrategyModal: React.FC<StrategyModalProps> = ({
  visible,
  strategy,
  onClose,
  onSave,
}) => {
  // Set initial form state based on provided strategy or default values
  const [form, setForm] = useState<Partial<Strategy>>(
    strategy || {
      name: '',
      description: '',
      trigger: '',
      isActive: true,
      competingResponses: [],
      stimulusControls: [],
      communitySupports: [],
      notifications: [],
    }
  );

  const isEditMode = !!strategy?._id;
  const modalTitle = isEditMode ? 'Edit Strategy' : 'New Strategy';

  // Handle form field changes
  const handleChange = (field: keyof Strategy, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save button press
  const handleSave = () => {
    // Basic validation
    if (!form.name || !form.trigger) {
      // In a real app, you'd want to show validation errors
      console.error('Name and trigger are required fields');
      return;
    }

    onSave(form);
  };

  return (
    <Modal
      visible={visible}
      title={modalTitle}
      onClose={onClose}
      contentStyle={styles.modalContent}
      footer={
        <View style={styles.footerContainer}>
          <Button
            title="Cancel"
            onPress={onClose}
            type="secondary"
            containerStyle={styles.footerButton}
          />
          <Button
            title="Save"
            onPress={handleSave}
            containerStyle={styles.footerButton}
          />
        </View>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Strategy Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Strategy Name*</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Enter a name for this strategy"
            placeholderTextColor={theme.colors.text.tertiary}
          />
        </View>

        {/* Trigger */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Trigger*</Text>
          <TextInput
            style={styles.input}
            value={form.trigger}
            onChangeText={(value) => handleChange('trigger', value)}
            placeholder="What triggers this behavior?"
            placeholderTextColor={theme.colors.text.tertiary}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description || ''}
            onChangeText={(value) => handleChange('description', value)}
            placeholder="Additional details about this strategy..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Status Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Strategy Status</Text>
          <View style={styles.toggleRow}>
            <Switch
              value={form.isActive}
              onValueChange={(value) => handleChange('isActive', value)}
              trackColor={{
                false: theme.colors.utility.disabled,
                true: theme.colors.utility.success,
              }}
              thumbColor={theme.colors.neutral.white}
            />
            <Text style={styles.toggleStatus}>
              {form.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Section Header for Competing Responses */}
        <View style={styles.sectionHeader}>
          <Ionicons
            name="swap-horizontal-outline"
            size={20}
            color={theme.colors.primary.main}
          />
          <Text style={styles.sectionTitle}>Competing Responses</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDescription}>
          Add alternative behaviors to replace the problematic one
        </Text>

        {/* Empty state for Competing Responses */}
        {(!form.competingResponses || form.competingResponses.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No competing responses added yet
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Add Response</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Header for Stimulus Controls */}
        <View style={styles.sectionHeader}>
          <Ionicons
            name="shield-outline"
            size={20}
            color={theme.colors.primary.main}
          />
          <Text style={styles.sectionTitle}>Stimulus Controls</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDescription}>
          Add ways to modify your environment to reduce triggers
        </Text>

        {/* Empty state for Stimulus Controls */}
        {(!form.stimulusControls || form.stimulusControls.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No stimulus controls added yet</Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Add Control</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Header for Community Supports */}
        <View style={styles.sectionHeader}>
          <Ionicons
            name="people-outline"
            size={20}
            color={theme.colors.primary.main}
          />
          <Text style={styles.sectionTitle}>Community Supports</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDescription}>
          Add people who can help you with this strategy
        </Text>

        {/* Empty state for Community Supports */}
        {(!form.communitySupports || form.communitySupports.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No community supports added yet</Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Add Support</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: theme.spacing.md,
  } as ViewStyle,

  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  } as ViewStyle,

  formGroup: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,

  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,

  input: {
    backgroundColor: theme.colors.neutral.lighter,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  } as TextStyle,

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  } as TextStyle,

  toggleContainer: {
    marginBottom: theme.spacing.xl,
  } as ViewStyle,

  toggleLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  toggleStatus: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  } as TextStyle,

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  } as ViewStyle,

  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  } as TextStyle,

  sectionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
  } as TextStyle,

  addButton: {
    padding: theme.spacing.xs,
  } as ViewStyle,

  emptyState: {
    backgroundColor: theme.colors.neutral.lightest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  } as ViewStyle,

  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
  } as TextStyle,

  emptyButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: 'rgba(72, 82, 131, 0.1)',
    borderRadius: theme.borderRadius.sm,
  } as ViewStyle,

  emptyButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,

  footerButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  } as ViewStyle,
});

export default StrategyModal;