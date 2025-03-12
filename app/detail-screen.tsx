import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import { useFormContext } from './context/FormContext';

// Instance interface
interface Instance {
  _id: string;
  userId: string;
  createdAt: string;
  urgeStrength?: number;
  automatic?: boolean;
  location?: string;
  activity?: string;
  feelings?: string[];
  thoughts?: string;
  environment?: string[];
  notes?: string;
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { refreshTokenIfNeeded } = useAuth();
  const { formData, updateFormData, resetFormData } = useFormContext();

  // Determine if we're viewing an existing instance or creating a new one
  const isCreatingNewEntry = !id;

  // Fetch instance details if ID is provided
  useEffect(() => {
    const fetchInstanceDetail = async () => {
      if (!id) {
        // No ID means we're creating a new entry
        // Just show the form controls without loading indicator
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Ensure token is valid
        await refreshTokenIfNeeded();
        
        // Fetch instance by ID
        const response = await api.instances.getInstance(id as string);
        setInstance(response);
      } catch (err) {
        console.error('Error fetching instance details:', err);
        setError('Failed to load details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstanceDetail();
  }, [id]);

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

  // Handle back navigation
  const goBack = () => {
    router.back();
  };

  // Handle form submission for creating new entry
  const handleSubmit = async () => {
    try {
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      
      // Ensure token is valid
      await refreshTokenIfNeeded();
      
      // Convert form data to API request format
      const instanceData = {
        urgeStrength: formData.urgeStrength || 5,
        automatic: formData.automatic || false,
        location: formData.location || '',
        activity: formData.activity || '',
        feelings: formData.selectedEmotions || [],
        thoughts: formData.selectedThoughts?.join(', ') || '',
        environment: formData.selectedEnvironments || [],
        notes: formData.notes || '',
        time: formData.time || new Date(),
        duration: formData.duration || 1
      };
      
      // Submit to API
      const response = await api.instances.createInstance(instanceData);
      
      // Reset form after successful submission
      resetFormData();
      
      // Navigate to history screen
      Alert.alert(
        "Success",
        "Your entry has been recorded successfully.",
        [
          { 
            text: "View History", 
            onPress: () => router.push("/(tabs)/progress") 
          },
          {
            text: "Add Another",
            onPress: () => router.push("/") 
          }
        ]
      );
      
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert(
        "Error",
        "Failed to submit your entry. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Instance Details</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (id && (error || !instance)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Instance Details</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#d32f2f" />
          <Text style={styles.errorText}>{error || 'Instance not found'}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={goBack}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Creating a new entry - show form review and submission
  if (isCreatingNewEntry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Entry</Text>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Time:</Text>
            <Text style={styles.dateValue}>
              {formData.time ? formatDate(formData.time.toString()) : 'Now'}
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Behavior Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Urge Strength:</Text>
              <Text style={styles.detailValue}>
                {formData.urgeStrength !== undefined 
                  ? `${formData.urgeStrength}/10` 
                  : 'Not recorded'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {formData.intentionType || 'Not recorded'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>
                {formData.duration !== undefined 
                  ? `${formData.duration} ${formData.duration === 1 ? 'minute' : 'minutes'}` 
                  : 'Not recorded'}
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Context</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>
                {formData.location || 'Not recorded'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Activity:</Text>
              <Text style={styles.detailValue}>
                {formData.activity || 'Not recorded'}
              </Text>
            </View>
          </View>
          
          {formData.selectedEmotions && formData.selectedEmotions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Feelings</Text>
              <View style={styles.tagContainer}>
                {formData.selectedEmotions.map((feeling, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{feeling}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {formData.selectedThoughts && formData.selectedThoughts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thoughts</Text>
              <Text style={styles.paragraphText}>{formData.selectedThoughts.join(", ")}</Text>
            </View>
          )}
          
          {formData.selectedEnvironments && formData.selectedEnvironments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Environmental Factors</Text>
              <View style={styles.tagContainer}>
                {formData.selectedEnvironments.map((factor, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{factor}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {formData.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.paragraphText}>{formData.notes}</Text>
            </View>
          )}
          
          <View style={styles.spacer} />
        </ScrollView>
        
        <View style={styles.submitFooter}>
          <TouchableOpacity 
            style={styles.submitFullButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitFullButtonText}>Submit Entry</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Viewing an existing instance
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instance Details</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Recorded on:</Text>
          <Text style={styles.dateValue}>{formatDate(instance.createdAt)}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Behavior Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Urge Strength:</Text>
            <Text style={styles.detailValue}>
              {instance.urgeStrength !== undefined 
                ? `${instance.urgeStrength}/10` 
                : 'Not recorded'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>
              {instance.automatic !== undefined 
                ? (instance.automatic ? 'Automatic' : 'Deliberate Decision') 
                : 'Not recorded'}
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Context</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>
              {instance.location || 'Not recorded'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Activity:</Text>
            <Text style={styles.detailValue}>
              {instance.activity || 'Not recorded'}
            </Text>
          </View>
        </View>
        
        {instance.feelings && instance.feelings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feelings</Text>
            <View style={styles.tagContainer}>
              {instance.feelings.map((feeling, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{feeling}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {instance.thoughts && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thoughts</Text>
            <Text style={styles.paragraphText}>{instance.thoughts}</Text>
          </View>
        )}
        
        {instance.environment && instance.environment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Environmental Factors</Text>
            <View style={styles.tagContainer}>
              {instance.environment.map((factor, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{factor}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {instance.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.paragraphText}>{instance.notes}</Text>
          </View>
        )}
        
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  submitButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: '#555',
    width: 120,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e1f5fe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagText: {
    color: '#0288d1',
    fontSize: 14,
  },
  paragraphText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  spacer: {
    height: 40,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitFooter: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitFullButton: {
    backgroundColor: '#2a9d8f',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitFullButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
