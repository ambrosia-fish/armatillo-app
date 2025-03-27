import React, { useState } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { useFormContext } from '@/app/context/FormContext';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/services/api';
import theme from '@/app/constants/theme';

export default function SubmitScreen() {
  const router = useRouter();
  const { formData, updateFormData, resetFormData } = useFormContext();
  const { isAuthenticated, user } = useAuth();
  
  // Additional notes
  const [notes, setNotes] = useState<string>(
    formData.notes || ''
  );
  
  // Loading state
  const [submitting, setSubmitting] = useState(false);
  
  // Create API payload from form data
  const createPayload = () => {
    return {
      time: formData.time?.toISOString() || new Date().toISOString(),
      duration: formData.duration || 5,
      urgeStrength: formData.urgeStrength || 5,
      intentionType: formData.intentionType || 'automatic',
      selectedEnvironments: formData.selectedEnvironments || [],
      selectedEmotions: formData.selectedEmotions || [],
      selectedSensations: formData.selectedSensations || [],
      selectedThoughts: formData.selectedThoughts || [],
      selectedSensoryTriggers: formData.selectedSensoryTriggers || [],
      mentalDetails: formData.mentalDetails,
      physicalDetails: formData.physicalDetails,
      thoughtDetails: formData.thoughtDetails,
      environmentDetails: formData.environmentDetails,
      sensoryDetails: formData.sensoryDetails,
      notes: notes.trim() || undefined,
      userName: user?.name || user?.email,
      user_id: user?.id
    };
  };
  
  // Handle submit button
  const handleSubmit = async () => {
    // Update form data
    updateFormData({
      notes
    });
    
    // Start submitting
    setSubmitting(true);
    
    try {
      // Prepare payload
      const payload = createPayload();
      
      // Store locally for sync later if needed
      try {
        const allData = JSON.stringify(payload);
        await SecureStore.setItemAsync('bfrb_all_data', allData);
      } catch (error) {
        console.error('Error storing all data locally:', error);
      }
      
      // Submit to API if authenticated
      if (isAuthenticated) {
        await api.instances.createInstance(payload);
        
        // Show success message
        Alert.alert(
          'Success',
          'Your BFRB instance has been recorded successfully.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Reset form data
                resetFormData();
                // Navigate to home
                router.push('/(tabs)');
              }
            }
          ]
        );
      } else {
        // Show message about not being logged in
        Alert.alert(
          'Not Logged In',
          'You need to be logged in to save your data. This session was not saved to the cloud but has been stored locally.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Reset form data
                resetFormData();
                // Navigate to home
                router.push('/(tabs)');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting BFRB instance:', error);
      
      // Show error message
      Alert.alert(
        'Error',
        'There was a problem submitting your data. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      // Stop loading
      setSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary.main} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Final Details</Text>
        
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Notes</Text>
          <Text style={styles.cardDescription}>
            Add any other details or observations about this episode.
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="What else do you want to remember about this episode?"
            placeholderTextColor={theme.colors.text.tertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
        {submitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary.main} />
            <Text style={styles.loadingText}>Submitting...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.7}
              accessibilityLabel="Submit"
              accessibilityRole="button"
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.back()}
              activeOpacity={0.7}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle-outline" size={18} color={theme.colors.secondary.main} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
    minHeight: 150,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  submitButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  cancelButtonText: {
    marginLeft: 8,
    color: theme.colors.secondary.main,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
});
