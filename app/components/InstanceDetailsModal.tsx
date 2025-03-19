import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import OptionDictionaries, { OptionItem } from '../constants/optionDictionaries';
import { useAuth } from '../context/AuthContext';

// Define the Instance type
interface Instance {
  _id: string;
  userId?: string;
  createdAt: string;
  time?: string | Date;
  urgeStrength?: number;
  intentionType?: string;
  duration?: string | number;
  timeAgo?: string;
  // New fields based on the MongoDB data
  selectedEnvironments?: string[];
  selectedEmotions?: string[];
  selectedSensations?: string[];
  selectedThoughts?: string[];
  // Legacy fields
  automatic?: boolean;
  location?: string;
  activity?: string;
  feelings?: string[];
  physicalSensations?: string[];
  thoughts?: string[];
  environment?: string[];
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
  const { refreshTokenIfNeeded } = useAuth();

  // Fetch instance details when modal is opened
  useEffect(() => {
    const fetchInstanceDetails = async () => {
      if (!instanceId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Ensure token is fresh
        await refreshTokenIfNeeded();
        
        console.log('Fetching instance details for ID:', instanceId);
        const data = await api.instances.getInstance(instanceId);
        console.log('Instance data received:', data ? 'yes' : 'no');
        setInstance(data);
      } catch (err) {
        console.error('Error fetching instance details:', err);
        
        let errorMessage = 'Failed to load details. Please try again.';
        if (err instanceof Error) {
          errorMessage += '\n\nDetails: ' + err.message;
        }
        
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isVisible && instanceId) {
      fetchInstanceDetails();
    }
  }, [isVisible, instanceId, refreshTokenIfNeeded]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get option label and emoji by ID
  const getOptionDetails = (optionId: string, optionsList: OptionItem[]): { label: string, emoji: string } => {
    const option = optionsList.find(opt => opt.id === optionId);
    return option 
      ? { label: option.label, emoji: option.emoji } 
      : { label: optionId, emoji: '' }; // Fallback to ID if not found
  };
  
  // Render array items with emojis
  const renderListWithEmojis = (items?: string[], optionsList?: OptionItem[]) => {
    if (!items || items.length === 0 || !optionsList) {
      return <Text style={styles.infoValue}>None</Text>;
    }
    
    return (
      <View style={styles.listContainer}>
        {items.map((itemId, index) => {
          const { label, emoji } = getOptionDetails(itemId, optionsList);
          return (
            <View key={index} style={styles.listItem}>
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={styles.listItemText}>{label}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Get the behavior type (automatic/intentional)
  const getBehaviorType = () => {
    if (instance?.intentionType) {
      return instance.intentionType === 'automatic' ? 'Automatic' : 'Intentional';
    } else if (instance?.automatic !== undefined) {
      return instance.automatic ? 'Automatic' : 'Deliberate';
    }
    return 'Unknown';
  };

  // Get feeling items (handles both selectedEmotions and feelings array)
  const getFeelingsArray = () => {
    return instance?.selectedEmotions || instance?.feelings || [];
  };

  // Get physical sensations (handles both selectedSensations and physicalSensations array)
  const getSensationsArray = () => {
    return instance?.selectedSensations || instance?.physicalSensations || [];
  };

  // Get thoughts (handles both selectedThoughts and thoughts array)
  const getThoughtsArray = () => {
    return instance?.selectedThoughts || instance?.thoughts || [];
  };

  // Get environments (handles both selectedEnvironments and environment array)
  const getEnvironmentsArray = () => {
    return instance?.selectedEnvironments || instance?.environment || [];
  };

  // Format duration
  const formatDuration = (duration?: string | number) => {
    if (!duration) return 'Unknown';
    return typeof duration === 'number' ? `${duration} minutes` : duration;
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
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Instance Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Loading details...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  if (instanceId) {
                    setLoading(true);
                    setError(null);
                    
                    refreshTokenIfNeeded()
                      .then(() => api.instances.getInstance(instanceId))
                      .then(data => setInstance(data))
                      .catch(err => {
                        console.error(err);
                        setError('Failed to load details. Please try again.');
                      })
                      .finally(() => setLoading(false));
                  }
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : instance ? (
            <ScrollView style={styles.scrollView}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>When</Text>
                <Text style={styles.dateText}>{formatDate(instance.createdAt)}</Text>
                
                {(instance.duration || instance.timeAgo) && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Duration:</Text>
                    <Text style={styles.infoValue}>{formatDuration(instance.duration)}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>BFRB Details</Text>
                
                {instance.urgeStrength !== undefined && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Urge Strength:</Text>
                    <Text style={styles.infoValue}>{instance.urgeStrength}/10</Text>
                  </View>
                )}
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type:</Text>
                  <Text style={styles.infoValue}>{getBehaviorType()}</Text>
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Environment</Text>
                
                {instance.location && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Location:</Text>
                    <Text style={styles.infoValue}>{instance.location}</Text>
                  </View>
                )}
                
                {instance.activity && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Activity:</Text>
                    <Text style={styles.infoValue}>{instance.activity}</Text>
                  </View>
                )}
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Environment:</Text>
                  {renderListWithEmojis(getEnvironmentsArray(), OptionDictionaries.environmentOptions)}
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mental & Physical State</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Feelings:</Text>
                  {renderListWithEmojis(getFeelingsArray(), OptionDictionaries.feelingOptions)}
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Physical Sensations:</Text>
                  {renderListWithEmojis(getSensationsArray(), OptionDictionaries.sensationOptions)}
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Thoughts:</Text>
                  {renderListWithEmojis(getThoughtsArray(), OptionDictionaries.thoughtOptions)}
                </View>
              </View>
              
              {instance.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{instance.notes}</Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No instance details found</Text>
            </View>
          )}
        </View>
      </View>
      <StatusBar style="dark" />
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    marginRight: 8,
    minWidth: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 16,
    marginRight: 8,
  },
  listItemText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default InstanceDetailsModal;
