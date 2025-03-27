import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
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

// Simplified Instance type
interface Instance {
  _id: string;
  createdAt: string;
  urgeStrength?: number;
  intentionType?: string;
  duration?: string | number;
  selectedEnvironments?: string[];
  selectedEmotions?: string[];
  selectedSensations?: string[];
  selectedThoughts?: string[];
  notes?: string;
}

interface InstanceDetailsModalProps {
  isVisible: boolean;
  instanceId: string | null;
  onClose: () => void;
}

const InstanceDetailsModal: React.FC<InstanceDetailsModalProps> = ({
  isVisible,
  instanceId,
  onClose
}) => {
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch instance details
  useEffect(() => {
    if (!isVisible || !instanceId) return;
    
    const fetchInstance = async () => {
      try {
        setLoading(true);
        await ensureValidToken();
        const data = await api.instances.getInstance(instanceId);
        setInstance(data);
      } catch (err) {
        console.error('Error fetching instance:', err);
        setError('Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    fetchInstance();
  }, [isVisible, instanceId]);

  // Render items with emojis
  const renderItems = (items?: string[], optionsList?: OptionItem[]) => {
    if (!items?.length || !optionsList) return <Text style={styles.infoValue}>None</Text>;
    
    return (
      <View style={styles.tagContainer}>
        {items.map((id, index) => {
          const option = optionsList.find(opt => opt.id === id) || { label: id, emoji: '📝' };
          return (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{option.emoji} {option.label}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
              <Text style={styles.errorText}>{error}</Text>
              <Button 
                title="Retry" 
                variant="primary" 
                onPress={() => setError(null)}
              />
            </View>
          ) : !instance ? (
            <View style={styles.centered}>
              <Text style={styles.message}>No details found</Text>
            </View>
          ) : (
            <ScrollView style={styles.content}>
              {/* When */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>When</Text>
                <Text style={styles.dateText}>{formatDate(instance.createdAt)}</Text>
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
                {instance.urgeStrength && (
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
              </View>
              
              {/* Feelings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Feelings</Text>
                {renderItems(instance.selectedEmotions, OptionDictionaries.feelingOptions)}
              </View>
              
              {/* Sensations */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Physical Sensations</Text>
                {renderItems(instance.selectedSensations, OptionDictionaries.sensationOptions)}
              </View>
              
              {/* Thoughts */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thoughts</Text>
                {renderItems(instance.selectedThoughts, OptionDictionaries.thoughtOptions)}
              </View>
              
              {/* Notes */}
              {instance.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.notes}>{instance.notes}</Text>
                </View>
              )}
            </ScrollView>
          )}
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