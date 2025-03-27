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
        
        <RNText style={styles.headerTitle}>Environment</RNText>
        
        {/* Empty view for layout balance */}
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where were you?</Text>
          <Text style={styles.sectionDescription}>
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
            textAlignVertical="top"
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
