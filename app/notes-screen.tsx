import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sensoryOptions } from './constants/optionDictionaries';
import EmojiSelectionGrid from './components/EmojiSelectionGrid';
import CancelFooter from './components/CancelFooter';
import { useFormContext } from './context/FormContext';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import storage, { STORAGE_KEYS } from './utils/storage';

export default function NotesScreen() {
  const router = useRouter();
  const { formData, updateFormData, resetFormData } = useFormContext();
  const { user, refreshTokenIfNeeded } = useAuth();
  
  // Track loading state for API calls
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize state from context if available
  const [notes, setNotes] = useState(
    formData.notes || ''
  );
  const [selectedSensoryTriggers, setSelectedSensoryTriggers] = useState<string[]>(
    formData.selectedSensoryTriggers || []
  );

  // Store user name in AsyncStorage when available
  useEffect(() => {
    const storeUserName = async () => {
      if (user && user.displayName) {
        try {
          await storage.setItem(STORAGE_KEYS.USER_NAME, user.displayName);
          console.log('User name stored in AsyncStorage:', user.displayName);
        } catch (error) {
          console.error('Error storing user name:', error);
        }
      }
    };

    storeUserName();
  }, [user]);
  
  const handleSave = async () => {
    // Prevent double submission
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Ensure token is valid
      await refreshTokenIfNeeded();
      
      // Get user info from auth context or AsyncStorage
      let userName = '';
      let userEmail = '';
      
      if (user) {
        // Use user data from auth context if available
        if (user.displayName) {
          userName = user.displayName;
        }
        if (user.email) {
          userEmail = user.email;
        }
      } else {
        // Fallback to AsyncStorage if user object isn't available
        const storedUserName = await storage.getItem(STORAGE_KEYS.USER_NAME);
        if (storedUserName) {
          userName = storedUserName;
        }
        // Try to get user email from storage
        const storedUser = await storage.getObject(STORAGE_KEYS.USER);
        if (storedUser && storedUser.email) {
          userEmail = storedUser.email;
        }
      }
      
      // Save final data to context
      updateFormData({
        selectedSensoryTriggers,
        notes,
        userName,
        userEmail
      });
      
      // Prepare complete data to send to API
      const completeData = {
        ...formData,
        selectedSensoryTriggers,
        notes,
        userName,
        userEmail
      };
      
      console.log('Submitting instance data:', JSON.stringify(completeData, null, 2));
      
      // Send data to API using our API service
      const responseData = await api.instances.createInstance(completeData);
      console.log('API response:', responseData);
      
      // Show success message and return to home
      Alert.alert(
        "Instance Saved",
        "Your BFRB instance has been recorded successfully.",
        [
          { 
            text: "OK", 
            onPress: () => {
              // Reset form data after successful submission
              resetFormData();
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } catch (error) {
      // Handle errors
      console.error('Error saving instance:', error);
      
      let errorMessage = 'There was a problem saving your data. Please try again.';
      
      if (error instanceof Error) {
        errorMessage += '\n\nDetails: ' + error.message;
      }
      
      Alert.alert(
        "Error Saving",
        errorMessage,
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSensorySelection = (id: string) => {
    setSelectedSensoryTriggers(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      }
      return [...prevSelected, id];
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Additional Notes</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, isSubmitting && styles.disabledButton]} 
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Any additional notes?</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={6}
            placeholder="Add any additional notes, observations, or context..."
            value={notes}
            onChangeText={setNotes}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.infoText}>
            This is the last step. Press "Save" to record this BFRB instance.
          </Text>
          <TouchableOpacity 
            style={[styles.saveFullButton, isSubmitting && styles.disabledButton]} 
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Text style={styles.saveFullButtonText}>
              {isSubmitting ? 'Saving...' : 'Save Instance'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Add Cancel Footer with reset */}
      <CancelFooter onCancel={() => {
        // Reset form data when cancelling
        resetFormData();
      }} />
      
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
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#2a9d8f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  saveFullButton: {
    backgroundColor: '#2a9d8f',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveFullButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
