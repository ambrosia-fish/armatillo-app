import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { thoughtOptions } from './constants/optionDictionaries';
import { Header, Card } from './components';
import EmojiSelectionGrid from './components/EmojiSelectionGrid';
import CancelFooter from './components/CancelFooter';
import { useFormContext } from './context/FormContext';
import theme from './constants/theme';

export default function ThoughtsScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Initialize state from context if available
  const [thoughts, setThoughts] = useState(
    formData.thoughts || ''
  );
  const [selectedThoughts, setSelectedThoughts] = useState<string[]>(
    formData.selectedThoughts || []
  );
  
  const handleNext = () => {
    // Save data to context
    updateFormData({ 
      selectedThoughts,
      thoughts 
    });
    
    router.push('/notes-screen');
  };

  const handleThoughtSelection = (id: string) => {
    setSelectedThoughts(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      }
      return [...prevSelected, id];
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <Header 
        title="What were you thinking?"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
        rightText="Next"
        onRightPress={handleNext}
      />
      
      <ScrollView style={styles.content}>
        <Card containerStyle={styles.section}>
          <Text style={styles.sectionTitle}>Common thought patterns</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <EmojiSelectionGrid
            options={thoughtOptions}
            selectedItems={selectedThoughts}
            onSelect={handleThoughtSelection}
          />
        </Card>
      </ScrollView>
      
      <CancelFooter onCancel={() => {
        updateFormData({
          selectedThoughts: undefined,
          thoughts: undefined
        });
      }} />
      
      <StatusBar style="auto" />
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
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
});
