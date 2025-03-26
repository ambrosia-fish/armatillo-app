import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TextStyle, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { sensoryOptions } from './constants/optionDictionaries';
import { Header, Card, Button, Input } from './components';
import EmojiSelectionGrid from './components/EmojiSelectionGrid';
import CancelFooter from './components/CancelFooter';
import { useFormContext } from './context/FormContext';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import storage, { STORAGE_KEYS } from './utils/storage';
import { ensureValidToken } from './utils/tokenRefresher';
import theme from './constants/theme';

export default function NotesScreen() {
  const router = useRouter();
  const { formData, updateFormData, resetFormData } = useFormContext();
  const { user } = useAuth();
  
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
      await ensureValidToken();
      
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

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <Header 
        title="Additional Notes"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
        rightText={isSubmitting ? "Saving..." : "Save"}
        onRightPress={handleSave}
      />
      
      <ScrollView style={styles.content}>
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Any additional notes?</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={6}
            placeholder="Add any additional notes, observations, or context..."
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor={theme.colors.text.tertiary}
          />
        </Card>
        
        <Card containerStyle={styles.card}>
          <Text style={styles.infoText}>
            This is the last step. Press "Save" to record this BFRB instance.
          </Text>
          <Button 
            title={isSubmitting ? "Saving..." : "Save Instance"}
            variant="primary"
            size="large"
            onPress={handleSave}
            disabled={isSubmitting}
            style={styles.saveButton}
          />
        </Card>
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
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  } as ViewStyle,
  card: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  } as ViewStyle,
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  } as TextStyle,
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    minHeight: 150,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.background.secondary,
  } as ViewStyle,
  infoText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  } as TextStyle,
  saveButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'stretch',
  } as ViewStyle,
});
