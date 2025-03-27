import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  ViewStyle, 
  TextStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Text, Button, Card, Header, CancelFooter, EmojiSelectionGrid } from '@/app/components';
import { useFormContext } from '@/app/context/FormContext';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/services/api';
import theme from '@/app/constants/theme';

// Sensory trigger options
const triggerOptions = [
  { id: 'visual', label: 'Visual', emoji: '👁️' },
  { id: 'touch', label: 'Touch', emoji: '👆' },
  { id: 'sound', label: 'Sound', emoji: '👂' },
  { id: 'taste', label: 'Taste', emoji: '👅' },
  { id: 'smell', label: 'Smell', emoji: '👃' },
  { id: 'mirror', label: 'Mirror', emoji: '🪞' },
  { id: 'screen', label: 'Screen', emoji: '📱' },
  { id: 'texture', label: 'Texture', emoji: '🧶' },
  { id: 'light', label: 'Light', emoji: '💡' },
];

export default function NotesScreen() {
  const router = useRouter();
  const { formData, updateFormData, resetFormData } = useFormContext();
  const { isAuthenticated } = useAuth();
  
  // Default to empty array if not set
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    formData.selectedSensoryTriggers || []
  );
  
  // Notes
  const [notes, setNotes] = useState<string>(
    formData.notes || ''
  );
  
  // Loading state
  const [submitting, setSubmitting] = useState(false);
  
  // Toggle trigger selection
  const toggleTrigger = (triggerId: string) => {
    setSelectedTriggers(prev => {
      if (prev.includes(triggerId)) {
        return prev.filter(id => id !== triggerId);
      } else {
        return [...prev, triggerId];
      }
    });
  };
  
  // Handle submit
  const handleSubmit = async () => {
    try {
      // Update form data
      updateFormData({
        selectedSensoryTriggers: selectedTriggers,
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
        feelings: {
          mental: formData.selectedEmotions || [],
          physical: formData.selectedSensations || []
        },
        thoughts: formData.selectedThoughts || [],
        sensoryTriggers: selectedTriggers,
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      
      <Header 
        title="Final Details" 
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
      
      <ScrollView style={styles.content}>
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Any sensory triggers?</Text>
          <Text style={styles.cardDescription}>
            Were there any sensory triggers that led to the BFRB episode?
          </Text>
          
          <EmojiSelectionGrid
            items={triggerOptions}
            selectedIds={selectedTriggers}
            onToggleItem={toggleTrigger}
            numColumns={3}
          />
        </Card>
        
        <Card containerStyle={styles.card}>
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
        </Card>
      </ScrollView>
      
      <View style={styles.footer}>
        {submitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary.main} />
            <Text style={styles.loadingText}>Submitting...</Text>
          </View>
        ) : (
          <>
            <Button
              title="Submit"
              onPress={handleSubmit}
              size="large"
              style={styles.submitButton}
            />
            
            <CancelFooter onCancel={() => router.back()} />
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
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  } as ViewStyle,
  card: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  } as ViewStyle,
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  cardDescription: {
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
    minHeight: 150,
  } as TextStyle,
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  submitButton: {
    marginBottom: theme.spacing.md,
  } as ViewStyle,
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
