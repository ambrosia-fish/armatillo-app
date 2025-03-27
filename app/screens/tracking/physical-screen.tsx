import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, TextStyle, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Text, Button, Card, Header, CancelFooter, EmojiSelectionGrid } from '@/app/components';
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

export default function PhysicalScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default to empty arrays if not set
  const [selectedSensations, setSelectedSensations] = useState<string[]>(
    formData.selectedSensations || []
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
  
  // Handle continue button
  const handleContinue = () => {
    // Update form data
    updateFormData({
      selectedSensations,
      physicalDetails
    });
    
    // Navigate to next screen with updated path
    router.push('/screens/tracking/thoughts-screen');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      
      <Header 
        title="Physical State" 
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>What physical sensations did you notice?</Text>
          <Text style={styles.cardDescription}>
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
        </Card>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          size="large"
          style={styles.continueButton}
        />
        
        <CancelFooter onCancel={() => router.back()} />
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
  } as ViewStyle,
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
    textAlignVertical: 'top',
    minHeight: 100,
  } as TextStyle,
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  continueButton: {
    marginBottom: theme.spacing.md,
  } as ViewStyle,
});
