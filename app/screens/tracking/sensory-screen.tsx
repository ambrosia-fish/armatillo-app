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

// Sensory trigger options
const triggerOptions = [
  { id: 'visual', label: 'Visual', emoji: '👁️' },
  { id: 'touch', label: 'Touch', emoji: '👆' },
  { id: 'sound', label: 'Sound', emoji: '👂' },
  { id: 'taste', label: 'Taste', emoji: '👅' },
  { id: 'smell', label: 'Smell', emoji: '👃' },
  { id: 'mirror', label: 'Mirror', emoji: '🪞' },
  { id: 'screen', label: 'Screen', emoji: '📱' },
  { id: 'texture', label: 'Texture', emoji: '🧶' },
  { id: 'light', label: 'Light', emoji: '💡' },
  { id: 'noise', label: 'Noise', emoji: '🔊' },
  { id: 'temperature', label: 'Temperature', emoji: '🌡️' },
  { id: 'clothing', label: 'Clothing', emoji: '👕' },
];

export default function SensoryScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default selections
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    formData.selectedSensoryTriggers || []
  );
  
  const [sensoryDetails, setSensoryDetails] = useState<string>(
    formData.sensoryDetails || ''
  );
  
  // Toggle trigger selection
  const toggleTrigger = (triggerId: string) => {
    setSelectedTriggers(prev => {
      if (prev.includes(triggerId)) {
        return prev.filter(id => id !== triggerId);
      } else {
        return [...prev, triggerId];
      }
    });
  };
  
  // Handle continue button
  const handleContinue = async () => {
    // Update form data
    updateFormData({
      selectedSensoryTriggers: selectedTriggers,
      sensoryDetails
    });
    
    // Securely store sensory data
    try {
      const sensoryData = JSON.stringify({
        triggers: selectedTriggers,
        details: sensoryDetails
      });
      await SecureStore.setItemAsync('bfrb_sensory_data', sensoryData);
    } catch (error) {
      console.error('Error storing sensory data:', error);
    }
    
    // Navigate to next screen
    router.push('/screens/tracking/submit-screen');
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
        
        <Text style={styles.headerTitle}>Sensory Triggers</Text>
        
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Any sensory triggers?</Text>
          <Text style={styles.cardDescription}>
            Were there any sensory triggers that led to the BFRB episode?
          </Text>
          
          {/* Sensory Triggers Grid */}
          <View style={styles.optionsGrid}>
            {triggerOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedTriggers.includes(option.id) && styles.optionButtonSelected
                ]}
                onPress={() => toggleTrigger(option.id)}
                activeOpacity={0.7}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedTriggers.includes(option.id) }}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.optionLabel,
                  selectedTriggers.includes(option.id) && styles.optionLabelSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Any additional details about sensory triggers..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={sensoryDetails}
            onChangeText={setSensoryDetails}
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
    paddingBottom: 32,
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
