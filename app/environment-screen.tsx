import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { environmentOptions } from './constants/optionDictionaries';
import { Header, Card } from './components';
import EmojiSelectionGrid from './components/EmojiSelectionGrid';
import CancelFooter from './components/CancelFooter';
import { useFormContext } from './context/FormContext';
import theme from './constants/theme';

export default function EnvironmentScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Initialize state from context if available
  const [environmentDetails, setEnvironmentDetails] = useState(
    formData.environmentDetails || ''
  );
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
    formData.selectedEnvironments || []
  );
  
  const handleNext = () => {
    // Save data to context
    updateFormData({
      selectedEnvironments,
      environmentDetails
    });
    
    router.push('/feelings-screen');
  };

  const handleEnvironmentSelection = (id: string) => {
    setSelectedEnvironments(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      }
      return [...prevSelected, id];
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <Header 
        title="Where were you?"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
        rightText="Next"
        onRightPress={handleNext}
      />
      
      <ScrollView style={styles.content}>
        <Card containerStyle={styles.section}>
          <Text style={styles.sectionTitle}>Where were you?</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <EmojiSelectionGrid
            options={environmentOptions}
            selectedItems={selectedEnvironments}
            onSelect={handleEnvironmentSelection}
          />
        </Card>
      </ScrollView>
      
      <CancelFooter onCancel={() => {
        updateFormData({
          selectedEnvironments: undefined,
          environmentDetails: undefined
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
