import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Text, Button, Card, Header, CancelFooter, EmojiSelectionGrid } from '../../components';
import { useFormContext } from '../../context/FormContext';
import theme from '../../constants/theme';

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

export default function FeelingsScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default to empty arrays if not set
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    formData.selectedEmotions || []
  );
  
  const [selectedSensations, setSelectedSensations] = useState<string[]>(
    formData.selectedSensations || []
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
      selectedEmotions,
      selectedSensations
    });
    
    // Navigate to next screen with updated path
    router.push('/screens/tracking/thoughts-screen');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      
      <Header 
        title="Mental & Physical State" 
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
      
      <ScrollView style={styles.content}>
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
        </Card>
        
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