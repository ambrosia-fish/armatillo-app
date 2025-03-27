import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, ViewStyle, TextStyle, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

import { Text, Button, Card, Header, CancelFooter, EmojiSelectionGrid } from '@/app/components';
import { useFormContext } from '@/app/context/FormContext';
import theme from '@/app/constants/theme';

// Environment options
const environmentOptions = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'school', label: 'School', emoji: '🏫' },
  { id: 'car', label: 'Car', emoji: '🚗' },
  { id: 'public', label: 'Public', emoji: '🏙️' },
  { id: 'bathroom', label: 'Bathroom', emoji: '🚿' },
  { id: 'bedroom', label: 'Bedroom', emoji: '🛏️' },
  { id: 'kitchen', label: 'Kitchen', emoji: '🍽️' },
  { id: 'livingRoom', label: 'Living Room', emoji: '🛋️' },
  { id: 'computer', label: 'Computer', emoji: '💻' },
  { id: 'phone', label: 'Phone', emoji: '📱' },
  { id: 'desk', label: 'Desk', emoji: '🖥️' },
  { id: 'mirror', label: 'Mirror', emoji: '🪞' },
  { id: 'tv', label: 'TV/Media', emoji: '📺' },
  { id: 'social', label: 'Social Event', emoji: '👥' },
];

export default function EnvironmentScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default to empty array if not set
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
    formData.selectedEnvironments || []
  );
  
  // Additional details
  const [environmentDetails, setEnvironmentDetails] = useState<string>(
    formData.environmentDetails || ''
  );
  
  // Toggle environment selection
  const toggleEnvironment = (environmentId: string) => {
    setSelectedEnvironments(prev => {
      if (prev.includes(environmentId)) {
        return prev.filter(id => id !== environmentId);
      } else {
        return [...prev, environmentId];
      }
    });
  };
  
  // Check if an environment is selected
  const isSelected = (environmentId: string) => {
    return selectedEnvironments.includes(environmentId);
  };
  
  // Handle continue button
  const handleContinue = () => {
    // Update form data
    updateFormData({
      selectedEnvironments,
      environmentDetails
    });
    
    // Navigate to next screen with updated path
    router.push('/screens/tracking/mental-screen');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="auto" />
      
      {/* Hide the default navigation header and use Stack.Screen to configure it */}
      <Stack.Screen 
        options={{
          title: "Environment",
          headerBackTitle: "Back"
        }}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Where were you?</Text>
          <Text style={styles.cardDescription}>
            Select all environments and contexts that apply. You can select multiple options.
          </Text>
          
          <EmojiSelectionGrid
            items={environmentOptions}
            selectedIds={selectedEnvironments}
            onToggleItem={toggleEnvironment}
            numColumns={3}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Any additional details about your environment..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={environmentDetails}
            onChangeText={setEnvironmentDetails}
            multiline
            numberOfLines={3}
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
