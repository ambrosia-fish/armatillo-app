import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Text, Button, Card, Header, CancelFooter, EmojiSelectionGrid } from '../../components';
import { useFormContext } from '../../context/FormContext';
import theme from '../../constants/theme';

// Thought pattern options
const thoughtOptions = [
  { id: 'perfectionism', label: 'Perfectionism', emoji: '✨' },
  { id: 'selfCritical', label: 'Self-Critical', emoji: '👎' },
  { id: 'worryFuture', label: 'Worrying', emoji: '😟' },
  { id: 'ruminating', label: 'Ruminating', emoji: '🔄' },
  { id: 'allOrNothing', label: 'All-or-Nothing', emoji: '⚫️⚪️' },
  { id: 'catastrophizing', label: 'Catastrophizing', emoji: '💥' },
  { id: 'comparison', label: 'Comparing', emoji: '⚖️' },
  { id: 'shouldStatements', label: 'Should Statements', emoji: '📝' },
  { id: 'mindReading', label: 'Mind Reading', emoji: '🔮' },
  { id: 'blackAndWhite', label: 'Black & White', emoji: '🌓' },
  { id: 'personalizing', label: 'Personalizing', emoji: '🎯' },
  { id: 'needForControl', label: 'Need for Control', emoji: '🎮' },
  { id: 'repetitive', label: 'Repetitive Thoughts', emoji: '🔁' },
  { id: 'automatic', label: 'Automatic Thoughts', emoji: '⚙️' },
  { id: 'checklist', label: 'Mental Checklist', emoji: '✅' },
];

export default function ThoughtsScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default to empty array if not set
  const [selectedThoughts, setSelectedThoughts] = useState<string[]>(
    formData.selectedThoughts || []
  );
  
  // Toggle thought selection
  const toggleThought = (thoughtId: string) => {
    setSelectedThoughts(prev => {
      if (prev.includes(thoughtId)) {
        return prev.filter(id => id !== thoughtId);
      } else {
        return [...prev, thoughtId];
      }
    });
  };
  
  // Handle continue button
  const handleContinue = () => {
    // Update form data
    updateFormData({
      selectedThoughts
    });
    
    // Navigate to next screen
    router.push('/notes-screen');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      
      <Header 
        title="Thought Patterns" 
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
      
      <View style={styles.content}>
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>What thought patterns did you notice?</Text>
          <Text style={styles.cardDescription}>
            Select any thought patterns or mental habits you noticed before or during the BFRB.
          </Text>
          
          <EmojiSelectionGrid
            items={thoughtOptions}
            selectedIds={selectedThoughts}
            onToggleItem={toggleThought}
            numColumns={3}
          />
          
          <Text style={styles.helpText}>
            Identifying thought patterns can help you recognize triggers and develop alternative responses.
          </Text>
        </Card>
      </View>
      
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
  helpText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: theme.spacing.lg,
    textAlign: 'center',
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