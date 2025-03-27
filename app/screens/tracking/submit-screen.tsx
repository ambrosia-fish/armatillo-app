import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  ViewStyle, 
  TextStyle,
  TouchableOpacity,
  Text as RNText
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/app/components';
import { useFormContext } from '@/app/context/FormContext';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/services/api';
import theme from '@/app/constants/theme';

export default function SubmitScreen() {
  const router = useRouter();
  const { formData, updateFormData, resetFormData } = useFormContext();
  const { isAuthenticated } = useAuth();
  
  // Notes
  const [notes, setNotes] = useState<string>(
    formData.notes || ''
  );
  
  // Loading state
  const [submitting, setSubmitting] = useState(false);
  
  // Handle submit
  const handleSubmit = async () => {
    try {
      // Update form data
      updateFormData({
        notes
      });
      
      // Start loading
      setSubmitting(true);
      
      // Create the API payload from formData
      const payload = {
        time: {
          timestamp: formData.time?.toISOString() || new Date().toISOString(),
          duration: formData.duration || 5
        },
        urgeStrength: formData.urgeStrength || 5,
        intentionType: formData.intentionType || 'automatic',
        environment: formData.selectedEnvironments || [],
        environmentDetails: formData.environmentDetails,
        feelings: {
          mental: formData.selectedEmotions || [],
          physical: formData.selectedSensations || []
        },
        mentalDetails: formData.mentalDetails,
        physicalDetails: formData.physicalDetails,
        thoughts: formData.selectedThoughts || [],
        thoughtDetails: formData.thoughtDetails,
        sensoryTriggers: formData.selectedSensoryTriggers || [],
        notes: notes.trim() || undefined
      };
      
      // Only submit if user is authenticated
      if (isAuthenticated) {
        // Submit to the API
        const response = await api.instances.createInstance(payload);
        
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
        // If not authenticated, just show a message and navigate back
        Alert.alert(
          'Not Logged In',
          'You need to be logged in to save your data. This session was not saved.',
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
        'There was a problem submitting your data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      // Stop loading
      setSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Basic React Native Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary.main} />
        </TouchableOpacity>
        
        <RNText style={styles.headerTitle}>Final Details</RNText>
        
        {/* Empty view for layout balance */}
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <Text style={styles.sectionDescription}>
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
      
      <View style={styles.footer}>
        {submitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary.main} />
            <RNText style={styles.loadingText}>Submitting...</RNText>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <RNText style={styles.submitButtonText}>Submit</RNText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={18} color={theme.colors.secondary.main} />
              <RNText style={styles.cancelButtonText}>Cancel</RNText>
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
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  } as ViewStyle,
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
  } as TextStyle,
  backButton: {
    padding: 8,
  } as ViewStyle,
  headerRight: {
    width: 40,
  } as ViewStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  contentContainer: {
    padding: theme.spacing.lg,
  } as ViewStyle,
  section: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  sectionDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
    textAlignVertical: 'top',
    minHeight: 150,
  } as TextStyle,
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  submitButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  submitButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
  } as TextStyle,
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  } as ViewStyle,
  cancelButtonText: {
    marginLeft: 8,
    color: theme.colors.secondary.main,
    fontSize: theme.typography.fontSize.md,
  } as TextStyle,
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  } as ViewStyle,
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  } as TextStyle,
});
