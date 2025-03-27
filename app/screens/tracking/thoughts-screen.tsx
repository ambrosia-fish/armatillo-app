import React, { useState } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { useFormContext } from '@/app/context/FormContext';
import theme from '@/app/constants/theme';

// Thought pattern options
const thoughtOptions = [
  { id: 'perfectionism', label: 'Perfectionism', emoji: '✨' },
  { id: 'selfCritical', label: 'Self-Critical', emoji: '👎' },
  { id: 'worrying', label: 'Worrying', emoji: '😟' },
  { id: 'ruminating', label: 'Ruminating', emoji: '🔄' },
  { id: 'allOrNothing', label: 'All-or-Nothing', emoji: '⚫️⚪️' },
  { id: 'catastrophizing', label: 'Catastrophizing', emoji: '💥' },
  { id: 'comparing', label: 'Comparing', emoji: '⚖️' },
  { id: 'shouldStatements', label: 'Should Statements', emoji: '📝' },
  { id: 'mindReading', label: 'Mind Reading', emoji: '🔮' },
  { id: 'blackAndWhite', label: 'Black & White', emoji: '🌓' },
  { id: 'personalizing', label: 'Personalizing', emoji: '🎯' },
  { id: 'needForControl', label: 'Need for Control', emoji: '🎮' },
];

export default function ThoughtsScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default selections
  const [selectedThoughts, setSelectedThoughts] = useState<string[]>(
    formData.selectedThoughts || []
  );
  
  const [thoughtDetails, setThoughtDetails] = useState<string>(
    formData.thoughtDetails || ''
  );
  
  // Toggle thought pattern selection
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
  const handleContinue = async () => {
    // Update form data
    updateFormData({
      selectedThoughts,
      thoughtDetails
    });
    
    // Securely store thoughts data
    try {
      const thoughtsData = JSON.stringify({
        thoughts: selectedThoughts,
        details: thoughtDetails
      });
      await SecureStore.setItemAsync('bfrb_thoughts_data', thoughtsData);
    } catch (error) {
      console.error('Error storing thoughts data:', error);
    }
    
    // Navigate to next screen
    router.push('/screens/tracking/physical-screen');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary.main} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Thought Patterns</Text>
        
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What thought patterns did you notice?</Text>
          <Text style={styles.cardDescription}>
            Select any thought patterns or mental habits you noticed before or during the BFRB.
          </Text>
          
          {/* Thought Patterns Grid */}
          <View style={styles.optionsGrid}>
            {thoughtOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedThoughts.includes(option.id) && styles.optionButtonSelected
                ]}
                onPress={() => toggleThought(option.id)}
                activeOpacity={0.7}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedThoughts.includes(option.id) }}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.optionLabel,
                  selectedThoughts.includes(option.id) && styles.optionLabelSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Any specific thoughts you were having..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={thoughtDetails}
            onChangeText={setThoughtDetails}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.7}
          accessibilityLabel="Continue"
          accessibilityRole="button"
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <Ionicons name="close-circle-outline" size={18} color={theme.colors.secondary.main} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    width: '33.33%',
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    borderRadius: 8,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 12,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: theme.colors.primary.main,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    fontSize: 14,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
    minHeight: 80,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  continueButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  cancelButtonText: {
    marginLeft: 8,
    color: theme.colors.secondary.main,
    fontSize: 14,
  },
});
