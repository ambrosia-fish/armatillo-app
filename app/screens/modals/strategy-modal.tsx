import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ScrollView,
  Switch,
  Platform,
  View as RNView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './modal';
import { View, Text, Button } from '@/app/components';
import theme from '@/app/constants/theme';
import { Strategy, CompetingResponse, StimulusControl, CommunitySupport } from '@/app/components/StrategyCard';

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
  // State for tracking edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  
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

  // Reset form and edit mode when strategy changes
  useEffect(() => {
    if (strategy) {
      setForm(strategy);
      setIsEditMode(false); // Always start in view mode
    } else {
      // For new strategies, start in edit mode with defaults
      setForm({
        name: '',
        description: '',
        trigger: '',
        isActive: true,
        competingResponses: [],
        stimulusControls: [],
        communitySupports: [],
        notifications: [],
      });
      setIsEditMode(true);
    }
  }, [strategy, visible]);

  // Modal title based on mode
  const getModalTitle = () => {
    if (!strategy) return 'New Strategy';
    return isEditMode ? 'Edit Strategy' : strategy.name;
  };

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
    setIsEditMode(false);
  };

  // Render the appropriate content based on mode
  const renderContent = () => {
    if (isEditMode) {
      return renderEditMode();
    } else {
      return renderViewMode();
    }
  };

  // Render the edit mode content
  const renderEditMode = () => {
    return (
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
    );
  };

  // Render the view mode content
  const renderViewMode = () => {
    if (!strategy) return null;

    return (
      <ScrollView
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            strategy.isActive ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              strategy.isActive ? styles.activeText : styles.inactiveText
            ]}>
              {strategy.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Trigger */}
        <View style={styles.viewSection}>
          <View style={styles.viewSectionHeader}>
            <Ionicons
              name="flash-outline"
              size={20}
              color={theme.colors.primary.main}
            />
            <Text style={styles.viewSectionTitle}>Trigger</Text>
          </View>
          <Text style={styles.viewSectionContent}>{strategy.trigger}</Text>
        </View>

        {/* Description (if available) */}
        {strategy.description && (
          <View style={styles.viewSection}>
            <View style={styles.viewSectionHeader}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={theme.colors.primary.main}
              />
              <Text style={styles.viewSectionTitle}>Description</Text>
            </View>
            <Text style={styles.viewSectionContent}>{strategy.description}</Text>
          </View>
        )}

        {/* Competing Responses */}
        <View style={styles.viewSection}>
          <View style={styles.viewSectionHeader}>
            <Ionicons
              name="swap-horizontal-outline"
              size={20}
              color={theme.colors.primary.main}
            />
            <Text style={styles.viewSectionTitle}>Competing Responses</Text>
          </View>
          
          {strategy.competingResponses.length > 0 ? (
            strategy.competingResponses.map((response: CompetingResponse) => (
              <View key={response._id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{response.description}</Text>
                  <View style={[
                    styles.itemStatusBadge,
                    response.isActive ? styles.activeBadge : styles.inactiveBadge
                  ]}>
                    <Text style={[
                      styles.itemStatusText,
                      response.isActive ? styles.activeText : styles.inactiveText
                    ]}>
                      {response.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                {response.notes && (
                  <Text style={styles.itemNotes}>{response.notes}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No competing responses added</Text>
          )}
        </View>

        {/* Stimulus Controls */}
        <View style={styles.viewSection}>
          <View style={styles.viewSectionHeader}>
            <Ionicons
              name="shield-outline"
              size={20}
              color={theme.colors.primary.main}
            />
            <Text style={styles.viewSectionTitle}>Stimulus Controls</Text>
          </View>
          
          {strategy.stimulusControls.length > 0 ? (
            strategy.stimulusControls.map((control: StimulusControl) => (
              <View key={control._id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{control.description}</Text>
                  <View style={[
                    styles.itemStatusBadge,
                    control.isActive ? styles.activeBadge : styles.inactiveBadge
                  ]}>
                    <Text style={[
                      styles.itemStatusText,
                      control.isActive ? styles.activeText : styles.inactiveText
                    ]}>
                      {control.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                {control.notes && (
                  <Text style={styles.itemNotes}>{control.notes}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No stimulus controls added</Text>
          )}
        </View>

        {/* Community Supports */}
        <View style={styles.viewSection}>
          <View style={styles.viewSectionHeader}>
            <Ionicons
              name="people-outline"
              size={20}
              color={theme.colors.primary.main}
            />
            <Text style={styles.viewSectionTitle}>Community Supports</Text>
          </View>
          
          {strategy.communitySupports.length > 0 ? (
            strategy.communitySupports.map((support: CommunitySupport) => (
              <View key={support._id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{support.name}</Text>
                  <View style={[
                    styles.itemStatusBadge,
                    support.isActive ? styles.activeBadge : styles.inactiveBadge
                  ]}>
                    <Text style={[
                      styles.itemStatusText,
                      support.isActive ? styles.activeText : styles.inactiveText
                    ]}>
                      {support.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <View style={styles.supportDetails}>
                  {support.relationship && (
                    <Text style={styles.supportDetail}>
                      <Text style={styles.supportLabel}>Relationship: </Text>
                      {support.relationship}
                    </Text>
                  )}
                  {support.contactInfo && (
                    <Text style={styles.supportDetail}>
                      <Text style={styles.supportLabel}>Contact: </Text>
                      {support.contactInfo}
                    </Text>
                  )}
                  {support.notes && (
                    <Text style={styles.itemNotes}>{support.notes}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No community supports added</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  // Render the footer buttons based on mode
  const renderFooter = () => {
    if (isEditMode) {
      // Edit mode footer
      return (
        <View style={styles.footerContainer}>
          <Button
            title="Cancel"
            onPress={() => {
              if (strategy) {
                // If editing existing strategy, go back to view mode
                setIsEditMode(false);
                setForm(strategy); // Reset form to original values
              } else {
                // If creating new strategy, close modal
                onClose();
              }
            }}
            type="secondary"
            containerStyle={styles.footerButton}
          />
          <Button
            title="Save"
            onPress={handleSave}
            containerStyle={styles.footerButton}
          />
        </View>
      );
    } else {
      // View mode footer
      return (
        <View style={styles.footerContainer}>
          <Button
            title="Close"
            onPress={onClose}
            type="secondary"
            containerStyle={styles.footerButton}
          />
          <Button
            title="Edit"
            onPress={() => setIsEditMode(true)}
            containerStyle={styles.footerButton}
          />
        </View>
      );
    }
  };

  return (
    <Modal
      visible={visible}
      title={getModalTitle()}
      onClose={onClose}
      contentStyle={styles.modalContent}
      footer={renderFooter()}
    >
      {renderContent()}
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

  // Edit mode styles
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
    marginLeft: theme.spacing.lg + theme.spacing.xs,
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

  // View mode styles
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  } as ViewStyle,

  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  } as ViewStyle,

  activeBadge: {
    backgroundColor: 'rgba(107, 168, 119, 0.2)',
  } as ViewStyle,

  inactiveBadge: {
    backgroundColor: 'rgba(125, 132, 161, 0.2)',
  } as ViewStyle,

  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,

  activeText: {
    color: theme.colors.utility.success,
  } as TextStyle,

  inactiveText: {
    color: theme.colors.text.tertiary,
  } as TextStyle,

  viewSection: {
    marginBottom: theme.spacing.xl,
  } as ViewStyle,

  viewSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,

  viewSectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  } as TextStyle,

  viewSectionContent: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.lg + theme.spacing.xs,
  } as TextStyle,

  itemContainer: {
    backgroundColor: theme.colors.neutral.lightest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.lg,
  } as ViewStyle,

  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,

  itemTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,

  itemStatusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  } as ViewStyle,

  itemStatusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as '500',
  } as TextStyle,

  itemNotes: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  } as TextStyle,

  supportDetails: {
    marginTop: theme.spacing.xs,
  } as ViewStyle,

  supportDetail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,

  supportLabel: {
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.secondary,
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