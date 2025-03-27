import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  ViewStyle, 
  TextStyle, 
  ScrollView,
  TouchableOpacity,
  Text as RNText
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Text, EmojiSelectionGrid } from '@/app/components';
import { useFormContext } from '@/app/context/FormContext';
import theme from '@/app/constants/theme';

// Physical sensation options
const sensationOptions = [
  { id: 'tense', label: 'Tense Muscles', emoji: '💪' },
  { id: 'sweaty', label: 'Sweaty', emoji: '💦' },
  { id: 'restless', label: 'Restless', emoji: '🦵' },
  { id: 'shaky', label: 'Shaky', emoji: '👐' },
  { id: 'heartRacing', label: 'Heart Racing', emoji: '💓' },
  { id: 'breathing', label: 'Fast Breathing', emoji: '😮‍💨' },
  { id: 'hot', label: 'Hot', emoji: '🔥' },
  { id: 'cold', label: 'Cold', emoji: '❄️' },
  { id: 'tired', label: 'Physically Tired', emoji: '🥱' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'itchy', label: 'Itchy', emoji: '👆' },
  { id: 'tingling', label: 'Tingling', emoji: '✨' },
  { id: 'pain', label: 'Pain', emoji: '🤕' },
  { id: 'hungry', label: 'Hungry', emoji: '🍽️' },
  { id: 'nauseous', label: 'Nauseous', emoji: '🤢' },
];

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

export default function PhysicalScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default to empty arrays if not set
  const [selectedSensations, setSelectedSensations] = useState<string[]>(
    formData.selectedSensations || []
  );
  
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    formData.selectedSensoryTriggers || []
  );
  
  // Additional details for physical sensations
  const [physicalDetails, setPhysicalDetails] = useState<string>(
    formData.physicalDetails || ''
  );
  
  // Toggle sensation selection
  const toggleSensation = (sensationId: string) => {
    setSelectedSensations(prev => {
      if (prev.includes(sensationId)) {
        return prev.filter(id => id !== sensationId);
      } else {
        return [...prev, sensationId];
      }
    });
  };
  
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
  
  // Handle continue button
  const handleContinue = () => {
    // Update form data
    updateFormData({
      selectedSensations,
      selectedSensoryTriggers: selectedTriggers,
      physicalDetails
    });
    
    // Navigate to next screen with updated path
    router.push('/screens/tracking/thoughts-screen');
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
        
        <RNText style={styles.headerTitle}>Physical & Sensory</RNText>
        
        {/* Empty view for layout balance */}
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What physical sensations did you notice?</Text>
          <Text style={styles.sectionDescription}>
            Select any physical sensations you noticed before or during the BFRB.
          </Text>
          
          <EmojiSelectionGrid
            items={sensationOptions}
            selectedIds={selectedSensations}
            onToggleItem={toggleSensation}
            numColumns={3}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Any additional details about your physical sensations..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={physicalDetails}
            onChangeText={setPhysicalDetails}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Any sensory triggers?</Text>
          <Text style={styles.sectionDescription}>
            Were there any sensory triggers that led to the BFRB episode?
          </Text>
          
          <EmojiSelectionGrid
            items={triggerOptions}
            selectedIds={selectedTriggers}
            onToggleItem={toggleTrigger}
            numColumns={3}
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <RNText style={styles.continueButtonText}>Continue</RNText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle-outline" size={18} color={theme.colors.secondary.main} />
          <RNText style={styles.cancelButtonText}>Cancel</RNText>
        </TouchableOpacity>
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
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
    textAlignVertical: 'top',
    minHeight: 80,
  } as TextStyle,
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  continueButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  continueButtonText: {
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
});
