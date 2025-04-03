import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextStyle,
  ViewStyle
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '@/app/services/api';
import OptionDictionaries, { OptionItem } from '@/app/constants/optionDictionaries';
import { ensureValidToken } from '@/app/utils/tokenRefresher';
import { Button, View, Text } from '@/app/components';
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';
import { Instance } from '@/app/types/Instance';

interface InstanceDetailsModalProps {
  isVisible: boolean;
  instanceId: string | null;
  onClose: () => void;
}

/**
 * Modal component to display detailed information about a BFRB instance
 * 
 * @param props - Component properties
 * @returns Rendered modal with instance details
 */
const InstanceDetailsModal: React.FC<InstanceDetailsModalProps> = ({
  isVisible,
  instanceId,
  onClose
}) => {
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle modal close with error handling
   */
  const handleClose = () => {
    try {
      onClose();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { component: 'InstanceDetailsModal', action: 'close' }
      });
    }
  };

  /**
   * Fetch instance details from API
   */
  const fetchInstance = async () => {
    if (!instanceId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await ensureValidToken();
      const data = await api.instances.getInstance(instanceId);
      
      // Normalize instance data to standardized format
      const normalizedData: Instance = {
        ...data,
        // Ensure time field exists (use createdAt as fallback)
        time: data.time || data.createdAt,
        // Ensure intentionType exists
        intentionType: data.intentionType || (data.automatic !== undefined 
          ? (data.automatic ? 'automatic' : 'intentional') 
          : 'automatic'),
        // Ensure duration exists
        duration: data.duration || 5,
      };
      
      setInstance(normalizedData);
    } catch (err) {
      const errorMessage = 'Failed to load instance details';
      setError(errorMessage);
      
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'api',
        context: { 
          component: 'InstanceDetailsModal', 
          action: 'fetchInstance',
          instanceId 
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch instance details when modal becomes visible
  useEffect(() => {
    if (isVisible && instanceId) {
      fetchInstance();
    }
  }, [isVisible, instanceId]);

  /**
   * Render items with emojis from the options list
   * 
   * @param items - Array of selected item IDs
   * @param optionsList - List of available options with emojis
   * @returns Rendered list of items with emojis
   */
  const renderItems = (items?: string[], optionsList?: OptionItem[]) => {
    if (!items?.length || !optionsList) return <Text style={styles.infoValue}>None</Text>;
    
    return (
      <View style={styles.tagContainer}>
        {items.map((id, index) => {
          const option = optionsList.find(opt => opt.id === id) || { label: id, emoji: '📝' };
          return (
            <View key={index} style={styles.tag}>
              <Text style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.primary.dark,
              }}>
                {option.emoji} {option.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  /**
   * Format date to human-readable string
   * 
   * @param date - ISO date string
   * @returns Formatted date string
   */
  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { component: 'InstanceDetailsModal', action: 'formatDate', date }
      });
      return 'Invalid date';
    }
  };

  /**
   * Handle retry when there's an error
   */
  const handleRetry = () => {
    try {
      setError(null);
      fetchInstance();
    } catch (err) {
      errorService.handleError(err instanceof Error ? err : String(err), {
        level: 'error',
        source: 'ui',
        context: { component: 'InstanceDetailsModal', action: 'retry' }
      });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
      accessibilityLabel="Instance details modal"
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Instance Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.colors.primary.main} />
              <Text style={styles.message}>Loading...</Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Text 
                style={styles.errorText}
                accessibilityRole="alert"
              >
                {error}
              </Text>
              <Button 
                title="Retry" 
                variant="primary" 
                onPress={handleRetry}
              />
            </View>
          ) : !instance ? (
            <View style={styles.centered}>
              <Text style={styles.message}>No details found</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.content}
              accessibilityLabel="Instance details"
            >
              {/* When */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>When</Text>
                <Text style={styles.dateText}>{formatDate(instance.time)}</Text>
                {instance.duration && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Duration:</Text>
                    <Text style={styles.value}>
                      {typeof instance.duration === 'number' 
                        ? `${instance.duration} min` 
                        : instance.duration}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>BFRB Details</Text>
                {instance.urgeStrength !== undefined && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Urge Strength:</Text>
                    <Text style={styles.value}>{instance.urgeStrength}/10</Text>
                  </View>
                )}
                <View style={styles.row}>
                  <Text style={styles.label}>Type:</Text>
                  <Text style={styles.value}>
                    {instance.intentionType === 'automatic' ? 'Automatic' : 'Intentional'}
                  </Text>
                </View>
              </View>
              
              {/* Environment */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Environment</Text>
                {renderItems(instance.selectedEnvironments, OptionDictionaries.environmentOptions)}
                {instance.environmentDetails && (
                  <Text style={styles.detailsText}>{instance.environmentDetails}</Text>
                )}
              </View>
              
              {/* Feelings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emotions</Text>
                {renderItems(instance.selectedEmotions, OptionDictionaries.emotionOptions)}
                {instance.mentalDetails && (
                  <Text style={styles.detailsText}>{instance.mentalDetails}</Text>
                )}
              </View>
              
              {/* Sensations */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Physical Sensations</Text>
                {renderItems(instance.selectedSensations, OptionDictionaries.sensationOptions)}
                {instance.physicalDetails && (
                  <Text style={styles.detailsText}>{instance.physicalDetails}</Text>
                )}
              </View>
              
              {/* Thoughts */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thoughts</Text>
                {renderItems(instance.selectedThoughts, OptionDictionaries.thoughtOptions)}
                {instance.thoughtDetails && (
                  <Text style={styles.detailsText}>{instance.thoughtDetails}</Text>
                )}
              </View>
              
              {/* Sensory Triggers */}
              {instance.selectedSensoryTriggers && instance.selectedSensoryTriggers.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Sensory Triggers</Text>
                  {renderItems(instance.selectedSensoryTriggers, OptionDictionaries.triggerOptions)}
                  {instance.sensoryDetails && (
                    <Text style={styles.detailsText}>{instance.sensoryDetails}</Text>
                  )}
                </View>
              )}
              
              {/* Notes */}
              {instance.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.notes}>{instance.notes}</Text>
                </View>
              )}
            </ScrollView>
          )}
          
          <StatusBar style="light" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.modal,
  } as ViewStyle,
  modalView: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxHeight: '90%',
    ...theme.shadows.lg,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    backgroundColor: 'transparent',
  } as ViewStyle,
  closeButton: {
    padding: theme.spacing.sm,
  } as ViewStyle,
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
  } as TextStyle,
  content: {
    padding: theme.spacing.lg,
  } as ViewStyle,
  section: {
    marginBottom: theme.spacing.lg,
    backgroundColor: 'transparent',
  } as ViewStyle,
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold as '700', 
    color: theme.colors.text.primary,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  row: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    backgroundColor: 'transparent',
  } as ViewStyle,
  label: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium as '500',
    width: 120,
  } as TextStyle,
  value: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,
  dateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  notes: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed,
  } as TextStyle,
  detailsText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  } as TextStyle,
  centered: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'transparent',
  } as ViewStyle,
  message: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  } as TextStyle,
  errorText: {
    color: theme.colors.utility.error,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
  } as ViewStyle,
  tag: {
    backgroundColor: theme.colors.primary.light,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    margin: 2,
  } as ViewStyle,
  tagText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.dark,
  } as TextStyle,
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
  } as TextStyle,
});

export default InstanceDetailsModal;