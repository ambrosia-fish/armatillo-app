import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from './services/api';
import { useAuth } from './context/AuthContext';

// Define the Instance type
interface Instance {
  _id: string;
  userId?: string;
  createdAt: string;
  time?: Date;
  urgeStrength?: number;
  intentionType?: string;
  duration?: string | number;
  timeAgo?: string;
  selectedEnvironments?: string[];
  selectedEmotions?: string[];
  selectedSensations?: string[];
  selectedThoughts?: string[];
  notes?: string;
}

export default function DetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { refreshTokenIfNeeded } = useAuth();
  const { id } = params;
  
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstance = async () => {
      if (!id) {
        setError('No instance ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await refreshTokenIfNeeded();
        const data = await api.instances.getInstance(id as string);
        setInstance(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching instance details:', err);
        setError('Failed to load instance details');
        setLoading(false);
        
        Alert.alert(
          'Error',
          'Failed to load instance details. Please try again.',
          [{ text: 'OK' }]
        );
      }
    };

    fetchInstance();
  }, [id, refreshTokenIfNeeded]);

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

  // Get the behavior type (automatic/intentional)
  const getBehaviorType = () => {
    if (instance?.intentionType) {
      return instance.intentionType === 'automatic' ? 'Automatic' : 'Intentional';
    }
    return 'Not specified';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Instance Details</Text>
        <View style={{ width: 40 }} />
      </View>

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
              if (id) {
                setLoading(true);
                setError(null);
                api.instances.getInstance(id as string)
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
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When</Text>
            <Text style={styles.dateText}>{formatDate(instance.createdAt)}</Text>
            
            {instance.duration && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Duration:</Text>
                <Text style={styles.infoValue}>
                  {typeof instance.duration === 'number' ? 
                    `${instance.duration} ${instance.duration === 1 ? 'minute' : 'minutes'}` : 
                    instance.duration}
                </Text>
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
            
            {instance.selectedEnvironments && instance.selectedEnvironments.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Environments:</Text>
                <View style={styles.tagContainer}>
                  {instance.selectedEnvironments.map((env, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{env}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mental & Physical State</Text>
            
            {instance.selectedEmotions && instance.selectedEmotions.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Feelings:</Text>
                <View style={styles.tagContainer}>
                  {instance.selectedEmotions.map((emotion, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{emotion}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {instance.selectedSensations && instance.selectedSensations.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Physical Sensations:</Text>
                <View style={styles.tagContainer}>
                  {instance.selectedSensations.map((sensation, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{sensation}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {instance.selectedThoughts && instance.selectedThoughts.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Thoughts:</Text>
                <View style={styles.tagContainer}>
                  {instance.selectedThoughts.map((thought, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{thought}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
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
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  tagContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e9f5f3',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    margin: 2,
  },
  tagText: {
    fontSize: 12,
    color: '#2a9d8f',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#2a9d8f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
