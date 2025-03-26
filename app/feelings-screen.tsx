import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { feelingOptions, sensationOptions } from './constants/optionDictionaries';
import { Header, Card } from './components';
import EmojiSelectionGrid from './components/EmojiSelectionGrid';
import CancelFooter from './components/CancelFooter';
import { useFormContext } from './context/FormContext';
import theme from './constants/theme';

export default function FeelingsScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Initialize state from context if available
  const [physicalFeelings, setPhysicalFeelings] = useState(
    formData.physicalFeelings || ''
  );
  const [mentalFeelings, setMentalFeelings] = useState(
    formData.mentalFeelings || ''
  );
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    formData.selectedEmotions || []
  );
  const [selectedSensations, setSelectedSensations] = useState<string[]>(
    formData.selectedSensations || []
  );
  
  const handleNext = () => {
    // Save data to context
    updateFormData({ 
      selectedEmotions,
      selectedSensations,
      physicalFeelings,
      mentalFeelings
    });
    
    router.push('/thoughts-screen');
  };

  const handleEmotionSelection = (id: string) => {
    setSelectedEmotions(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      }
      return [...prevSelected, id];
    });
  };

  const handleSensationSelection = (id: string) => {
    setSelectedSensations(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      }
      return [...prevSelected, id];
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <Header 
        title="How were you feeling?"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
        rightText="Next"
        onRightPress={handleNext}
      />
      
      <ScrollView style={styles.content}>
        <Card containerStyle={styles.section}>
          <Text style={styles.sectionTitle}>Mental/Emotional feelings</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <EmojiSelectionGrid
            options={feelingOptions}
            selectedItems={selectedEmotions}
            onSelect={handleEmotionSelection}
          />
        </Card>
        
        <Card containerStyle={styles.section}>
          <Text style={styles.sectionTitle}>Physical sensations</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <EmojiSelectionGrid
            options={sensationOptions}
            selectedItems={selectedSensations}
            onSelect={handleSensationSelection}
          />
        </Card>
      </ScrollView>
      
      <CancelFooter onCancel={() => {
        updateFormData({
          selectedEmotions: undefined,
          selectedSensations: undefined,
          physicalFeelings: undefined,
          mentalFeelings: undefined
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
