import React, { useState } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import theme from '@/app/constants/theme';
import { Header, Button } from '@/app/components';
import { useFormContext } from '@/app/context/FormContext';
import { errorService } from '@/app/services/ErrorService';

/**
 * Screen for creating a new tracking instance from scratch
 */
export default function NewEntryScreen() {
  const router = useRouter();
  const { updateFormData } = useFormContext();
  
  // Basic form state
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  
  /**
   * Handle saving the new entry and navigating to the next screen
   */
  const handleSave = () => {
    try {
      // Update form data with initial values
      updateFormData({
        name: name.trim() || 'Unnamed Instance',
        notes,
        time: new Date(), // Default to current time
        duration: 5, // Default to 5 minutes
      });
      
      // Navigate to the time screen to continue the tracking flow
      router.push('/screens/tracking/time-screen');
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'save_new_entry' }
      });
    }
  };

  /**
   * Handle cancellation and return to previous screen
   */
  const handleCancel = () => {
    try {
      router.back();
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'cancel_new_entry' }
      });
    }
  };

  /**
   * Clear all form fields
   */
  const handleClear = () => {
    try {
      setName('');
      setNotes('');
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'clear_new_entry_form' }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Header 
        title="New Instance" 
        showBackButton 
        onLeftPress={handleCancel}
        rightText="Clear"
        onRightPress={handleClear}
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Text style={styles.sectionDescription}>
            Fill in basic information about this BFRB instance.
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="E.g., Morning episode, Before meeting, etc."
              placeholderTextColor={theme.colors.text.tertiary}
              accessibilityLabel="Instance name"
              returnKeyType="next"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional details you want to record..."
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Instance notes"
            />
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Ionicons 
            name="information-circle" 
            size={24} 
            color={theme.colors.primary.main} 
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            This is just the first step. After you continue, you'll be able to add more details such as time, duration, triggers, and other information.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Continue"
          variant="primary"
          onPress={handleSave}
          style={styles.continueButton}
        />
        
        <Button
          title="Cancel"
          variant="text"
          onPress={handleCancel}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  formSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.primary.light + '15', // 15% opacity
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  infoIcon: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  continueButton: {
    marginBottom: theme.spacing.md,
  },
});
