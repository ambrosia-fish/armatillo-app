import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  View as RNView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextStyle,
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/app/services/api';
import { ensureValidToken } from '@/app/utils/tokenRefresher';
import Button from '@/app/components/Button';
import { View, Text } from '@/app/components/Themed';
import theme from '@/app/constants/theme';
import { errorService } from '@/app/services/ErrorService';
import { Instance } from '@/app/types/Instance';
import EmojiPill from '@/app/components/EmojiPill';
import OptionDictionaries, { OptionItem } from '@/app/constants/optionDictionaries';

interface InstanceDetailsModalProps {
  visible?: boolean;
  isVisible?: boolean; // For backward compatibility
  instanceId: string | null;
  onClose: () => void;
}

// Helper titles for the category sections
const categoryTitles = {
  environments: 'Where were you?',
  activities: 'What were you doing?',
  emotions: 'How were you feeling?',
  thoughts: 'What were you thinking?',
  sensations: 'What were you experiencing?'
};

const InstanceDetailsModal: React.FC<InstanceDetailsModalProps> = ({
  visible,
  isVisible,
  instanceId,
  onClose
}) => {
  const isModalVisible = visible !== undefined ? visible : isVisible || false;
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstance = async () => {
      if (!instanceId) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching instance with ID:", instanceId);
        
        await ensureValidToken();
        const data = await api.instances.getInstance(instanceId);
        console.log("Received instance data:", JSON.stringify(data));
        
        const normalizedData = {
          ...data,
          time: data.time || data.createdAt,
          intentionType: data.intentionType || (data.automatic !== undefined 
            ? (data.automatic ? 'automatic' : 'intentional') : 'automatic'),
          duration: data.duration || 5,
          selectedEnvironments: data.selectedEnvironments || [],
          selectedActivities: data.selectedActivities || [],
          selectedEmotions: data.selectedEmotions || [],
          selectedThoughts: data.selectedThoughts || [],
          selectedSensations: data.selectedSensations || [],
        };
        
        console.log("Normalized instance data:", JSON.stringify(normalizedData));
        setInstance(normalizedData);
      } catch (err) {
        console.error("Error fetching instance:", err);
        setError('Failed to load instance details');
        errorService.handleError(err instanceof Error ? err : String(err), {
          level: 'error',
          source: 'api',
          context: { component: 'InstanceDetailsModal', action: 'fetchInstance', instanceId }
        });
      } finally {
        setLoading(false);
      }
    };

    if (isModalVisible && instanceId) {
      fetchInstance();
    }
  }, [isModalVisible, instanceId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatTimeOnly = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "Unknown time";
    }
  };
  
  // Get the corresponding option data from the dictionary for a selected ID
  const getOptionItemFromId = (optionsList: OptionItem[], id: string): OptionItem | undefined => {
    return optionsList.find(item => item.id === id);
  };
  
  // Render a category's selected options as pills
  const renderCategoryPills = (category: string) => {
    if (!instance) return null;
    
    let selectedIds: string[] = [];
    let optionsList: OptionItem[] = [];
    
    // Map category name to the corresponding property of instance and options dictionary
    switch(category) {
      case 'environments':
        selectedIds = instance.selectedEnvironments || [];
        optionsList = OptionDictionaries.locationOptions;
        break;
      case 'activities':
        selectedIds = instance.selectedActivities || [];
        optionsList = OptionDictionaries.activityOptions;
        break;
      case 'emotions':
        selectedIds = instance.selectedEmotions || [];
        optionsList = OptionDictionaries.emotionOptions;
        break;
      case 'thoughts':
        selectedIds = instance.selectedThoughts || [];
        optionsList = OptionDictionaries.thoughtOptions;
        break;
      case 'sensations':
        selectedIds = instance.selectedSensations || [];
        optionsList = OptionDictionaries.sensationOptions;
        break;
      default:
        return null;
    }
    
    if (selectedIds.length === 0) return null;
    
    const categoryTitle = categoryTitles[category as keyof typeof categoryTitles] || category;
    
    return (
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>{categoryTitle}</Text>
        <View style={styles.pillsContainer}>
          {selectedIds.map((id) => {
            const option = getOptionItemFromId(optionsList, id);
            return option ? (
              <View key={id} style={styles.pillWrapper}>
                <EmojiPill
                  id={id}
                  label={option.label}
                  emoji={option.emoji}
                  selected={true}
                  onToggle={() => {}} // No toggle action needed in view mode
                />
              </View>
            ) : null;
          })}
        </View>
      </View>
    );
  };

  if (!isModalVisible) return null;

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <RNView style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Instance Details</Text>
            <RNView style={{ width: 24 }} />
          </View>
          
          {/* Content */}
          <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
            {loading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
                <Text style={styles.loadingText}>Loading details...</Text>
              </View>
            ) : error ? (
              <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : !instance ? (
              <View style={styles.centered}>
                <Text>No data available</Text>
              </View>
            ) : (
              <>
                {/* Date */}
                <Text style={styles.dateText}>
                  {formatDate(instance.time)}
                </Text>
                
                {/* Time and Duration */}
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>
                    Time: {formatTimeOnly(instance.time)}
                  </Text>
                  <Text style={styles.timeText}>
                    Duration: {instance.duration} mins
                  </Text>
                </View>
                
                {/* Urge Strength - Using discrete blocks */}
                <Text style={styles.sectionTitle}>Urge Strength</Text>
                <View style={styles.urgeStrengthContainer}>
                  {[1, 2, 3, 4, 5].map((level) => {
                    const isActive = (Number(instance.urgeStrength) || 1) >= level;
                    return (
                      <View 
                        key={`urge-level-${level}`}
                        style={[
                          styles.urgeBlock,
                          isActive && styles.urgeBlockActive,
                          // Gradually darker shades for higher levels
                          isActive && level === 2 && styles.urgeBlockLevel2,
                          isActive && level === 3 && styles.urgeBlockLevel3,
                          isActive && level === 4 && styles.urgeBlockLevel4,
                          isActive && level === 5 && styles.urgeBlockLevel5,
                        ]}
                      />
                    );
                  })}
                </View>
                <View style={styles.urgeStrengthLabels}>
                  <Text style={styles.urgeLabel}>Very Weak</Text>
                  <Text style={styles.urgeLabel}>Very Strong</Text>
                </View>
                
                {/* Awareness Type */}
                <Text style={styles.sectionTitle}>Awareness Type</Text>
                <View style={styles.pillWrapper}>
                  {instance.intentionType && (
                    <EmojiPill
                      id={instance.intentionType}
                      label={instance.intentionType === 'automatic' ? 'Automatic' : 'Intentional'}
                      emoji={instance.intentionType === 'automatic' ? '🤖' : '🧠'}
                      selected={true}
                      onToggle={() => {}}
                    />
                  )}
                </View>
                
                {/* Category Pills for Environments, Activities, Emotions, Thoughts, Sensations */}
                {renderCategoryPills('environments')}
                {renderCategoryPills('activities')}
                {renderCategoryPills('emotions')}
                {renderCategoryPills('thoughts')}
                {renderCategoryPills('sensations')}
                
                {/* Notes */}
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>
                    {instance.notes || 'No notes for this instance'}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Close"
              onPress={onClose}
              containerStyle={styles.closeBtn}
            />
          </View>
        </View>
      </RNView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  } as ViewStyle,
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: { elevation: 5 },
    }),
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  } as ViewStyle,
  closeButton: {
    padding: 4,
  } as ViewStyle,
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  } as TextStyle,
  contentContainer: {
    maxHeight: '70%',
  } as ViewStyle,
  scrollContent: {
    padding: 16,
  } as ViewStyle,
  centered: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  } as ViewStyle,
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  } as TextStyle,
  errorText: {
    color: 'red',
    textAlign: 'center',
  } as TextStyle,
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  } as TextStyle,
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  } as ViewStyle,
  timeText: {
    fontSize: 14,
    color: '#333',
  } as TextStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  } as TextStyle,
  // Urge strength blocks styles
  urgeStrengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    gap: 6, // Space between blocks
  } as ViewStyle,
  urgeBlock: {
    flex: 1,
    height: 24,
    backgroundColor: '#F0F0F5',
    borderRadius: 4,
  } as ViewStyle,
  urgeBlockActive: {
    backgroundColor: '#FFC3C3', // Lightest shade for level 1
  } as ViewStyle,
  urgeBlockLevel2: {
    backgroundColor: '#FFA8A8',
  } as ViewStyle,
  urgeBlockLevel3: {
    backgroundColor: '#FF8A8A',
  } as ViewStyle,
  urgeBlockLevel4: {
    backgroundColor: '#FF6B6B',
  } as ViewStyle,
  urgeBlockLevel5: {
    backgroundColor: '#FF5252', // Darkest shade for level 5
  } as ViewStyle,
  urgeStrengthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  } as ViewStyle,
  urgeLabel: {
    fontSize: 12,
    color: '#666',
  } as TextStyle,
  pillContainer: {
    marginBottom: 24,
  } as ViewStyle,
  pill: {
    backgroundColor: '#E8EBFA',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#6E7BC4',
    alignSelf: 'flex-start',
  } as ViewStyle,
  pillText: {
    fontSize: 14,
    color: '#6E7BC4',
  } as TextStyle,
  notesContainer: {
    backgroundColor: '#F0F0F5',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    marginBottom: 16,
  } as ViewStyle,
  notesText: {
    fontSize: 14,
    color: '#333',
  } as TextStyle,
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  } as ViewStyle,
  closeBtn: {
    width: 150,
  } as ViewStyle,
  // New styles for category pills
  categorySection: {
    marginBottom: 20,
  } as ViewStyle,
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4, // To offset the margin on the pills
  } as ViewStyle,
  pillWrapper: {
    // This wrapper prevents the pill from extending across full width
    display: 'flex',
    flexDirection: 'row',
    margin: 4,
  } as ViewStyle,
});

export default InstanceDetailsModal;