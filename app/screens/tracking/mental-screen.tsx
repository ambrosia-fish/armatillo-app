import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, TextStyle, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

import { Text, Button, Card, Header, CancelFooter, EmojiSelectionGrid } from '@/app/components';
import { useFormContext } from '@/app/context/FormContext';
import theme from '@/app/constants/theme';

// Emotion options
const emotionOptions = [
  { id: 'stressed', label: 'Stressed', emoji: '😥' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
  { id: 'bored', label: 'Bored', emoji: '😒' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'content', label: 'Content', emoji: '😌' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'embarrassed', label: 'Embarrassed', emoji: '😳' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🥴' },
  { id: 'distracted', label: 'Distracted', emoji: '🤔' },
  { id: 'focused', label: 'Focused', emoji: '🧐' },
];

export default function MentalScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default to empty arrays if not set
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    formData.selectedEmotions || []
  );
  
  // Additional details for mental state
  const [mentalDetails, setMentalDetails] = useState<string>(
    formData.mentalDetails || ''
  );
  
  // Toggle emotion selection
  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev => {
      if (prev.includes(emotionId)) {
        return prev.filter(id => id !== emotionId);
      } else {
        return [...prev, emotionId];
      }
    });
  };
  
  // Handle continue button
  const handleContinue = () => {
    // Update form data
    updateFormData({
      selectedEmotions,
      mentalDetails
    });
    
    // Navigate to next screen with updated path
    router.push('/screens/tracking/physical-screen');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="auto" />
      
      {/* Hide the default navigation header and use Stack.Screen to configure it */}
      <Stack.Screen 
        options={{
          title: "Mental State",
          headerBackTitle: "Back"
        }}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>How were you feeling emotionally?</Text>
          <Text style={styles.cardDescription}>
            Select all emotions that apply to how you were feeling before or during the BFRB.
          </Text>
          
          <EmojiSelectionGrid
            items={emotionOptions}
            selectedIds={selectedEmotions}
            onToggleItem={toggleEmotion}
            numColumns={3}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Any additional details about your emotional state..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={mentalDetails}
            onChangeText={setMentalDetails}
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
