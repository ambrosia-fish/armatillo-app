import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
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
import api from '../services/api';
import OptionDictionaries, { OptionItem } from '../constants/optionDictionaries';
import { ensureValidToken } from '../utils/tokenRefresher';
import { Button } from './index';
import theme from '../constants/theme';

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
    if (!items?.length || !optionsList) return <Text style={styles.infoValue as TextStyle}>None</Text>;
    
    return (
      <View style={styles.tagContainer as ViewStyle}>
        {items.map((id, index) => {
          const option = optionsList.find(opt => opt.id === id) || { label: id, emoji: '📝' };
          return (
            <View key={index} style={styles.tag as ViewStyle}>
              <Text style={styles.tagText as TextStyle}>{option.emoji} {option.label}</Text>
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
      <View style={styles.centeredView as ViewStyle}>
        <View style={styles.modalView as ViewStyle}>
          {/* Header */}
          <View style={styles.header as ViewStyle}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton as ViewStyle}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title as TextStyle}>Instance Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.centered as ViewStyle}>
              <ActivityIndicator size="large" color={theme.colors.primary.main} />
              <Text style={styles.message as TextStyle}>Loading...</Text>
            </View>
          ) : error ? (
            <View style={styles.centered as ViewStyle}>
              <Text style={styles.errorText as TextStyle}>{error}</Text>
              <Button 
                title="Retry" 
                variant="primary" 
                onPress={() => setError(null)}
              />
            </View>
          ) : !instance ? (
            <View style={styles.centered as ViewStyle}>
              <Text style={styles.message as TextStyle}>No details found</Text>
            </View>
          ) : (
            <ScrollView style={styles.content as ViewStyle}>
              {/* When */}
              <View style={styles.section as ViewStyle}>
                <Text style={styles.sectionTitle as TextStyle}>When</Text>
                <Text style={styles.dateText as TextStyle}>{formatDate(instance.createdAt)}</Text>
                {instance.duration && (
                  <View style={styles.row as ViewStyle}>
                    <Text style={styles.label as TextStyle}>Duration:</Text>
                    <Text style={styles.value as TextStyle}>
                      {typeof instance.duration === 'number' 
                        ? `${instance.duration} min` 
                        : instance.duration}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Details */}
              <View style={styles.section as ViewStyle}>
                <Text style={styles.sectionTitle as TextStyle}>BFRB Details</Text>
                {instance.urgeStrength && (
                  <View style={styles.row as ViewStyle}>
                    <Text style={styles.label as TextStyle}>Urge Strength:</Text>
                    <Text style={styles.value as TextStyle}>{instance.urgeStrength}/10</Text>
                  </View>
                )}
                <View style={styles.row as ViewStyle}>
                  <Text style={styles.label as TextStyle}>Type:</Text>
                  <Text style={styles.value as TextStyle}>
                    {instance.intentionType === 'automatic' ? 'Automatic' : 'Intentional'}
                  </Text>
                </View>
              </View>
              
              {/* Environment */}
              <View style={styles.section as ViewStyle}>
                <Text style={styles.sectionTitle as TextStyle}>Environment</Text>
                {renderItems(instance.selectedEnvironments, OptionDictionaries.environmentOptions)}
              </View>
              
              {/* Feelings */}
              <View style={styles.section as ViewStyle}>
                <Text style={styles.sectionTitle as TextStyle}>Feelings</Text>
                {renderItems(instance.selectedEmotions, OptionDictionaries.feelingOptions)}
              </View>
              
              {/* Sensations */}
              <View style={styles.section as ViewStyle}>
                <Text style={styles.sectionTitle as TextStyle}>Physical Sensations</Text>
                {renderItems(instance.selectedSensations, OptionDictionaries.sensationOptions)}
              </View>
              
              {/* Thoughts */}
              <View style={styles.section as ViewStyle}>
                <Text style={styles.sectionTitle as TextStyle}>Thoughts</Text>
                {renderItems(instance.selectedThoughts, OptionDictionaries.thoughtOptions)}
              </View>
              
              {/* Notes */}
              {instance.notes && (
                <View style={styles.section as ViewStyle}>
                  <Text style={styles.sectionTitle as TextStyle}>Notes</Text>
                  <Text style={styles.notes as TextStyle}>{instance.notes}</Text>
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
  },
  modalView: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxHeight: '90%',
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold as '700', 
    color: theme.colors.text.primary,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium as '500',
    width: 120,
  },
  value: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    flex: 1,
  },
  dateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  notes: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  centered: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  message: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.utility.error,
    marginBottom: theme.spacing.md,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: theme.colors.primary.light,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    margin: 2,
  },
  tagText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.dark,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
  },
});

export default InstanceDetailsModal;