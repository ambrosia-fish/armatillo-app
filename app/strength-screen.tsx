import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CancelFooter from './components/CancelFooter';
import { useFormContext } from './context/FormContext';

export default function StrengthScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Initialize state from context if available
  const [urgeStrength, setUrgeStrength] = useState<number | null>(
    formData.urgeStrength || null
  );
  const [intentionType, setIntentionType] = useState<string | null>(
    formData.intentionType || null
  );
  
  // We'll use this to prevent preset selection for now
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleNext = () => {
    // Save the data to context
    updateFormData({
      urgeStrength: urgeStrength || undefined,
      intentionType: intentionType || undefined
    });
    
    // Navigate to the next screen in the questionnaire flow
    router.push('/environment-screen');
  };

  // Helper function to render strength option buttons (1-10)
  const renderStrengthOptions = () => {
    const options = [];
    for (let i = 1; i <= 10; i++) {
      options.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.strengthOption,
            urgeStrength === i && styles.selectedOption,
          ]}
          onPress={() => setUrgeStrength(i)}
        >
          <Text
            style={[
              styles.strengthOptionText,
              urgeStrength === i && styles.selectedOptionText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return options;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* We removed the custom header that was duplicating the Expo Router header */}
      <ScrollView style={styles.content}>
        {/* Presets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presets</Text>
          <Text style={styles.sectionSubtitle}>Save time by using common patterns</Text>
          
          <View style={styles.presetsContainer}>
            <Text style={styles.emptyPresetsText}>No presets available yet</Text>
            <TouchableOpacity 
              style={styles.newPresetButton}
              disabled={true}
            >
              <Text style={styles.newPresetButtonText}>+ New Preset</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Urge Strength Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How strong was the urge?</Text>
          <View style={styles.strengthOptionsContainer}>
            {renderStrengthOptions()}
          </View>
          <View style={styles.strengthLabelsContainer}>
            <Text style={styles.strengthLabel}>Mild</Text>
            <Text style={styles.strengthLabel}>Strong</Text>
          </View>
        </View>
        
        {/* Intention Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Was it intentional or automatic?</Text>
          <View style={styles.intentionOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.intentionOption,
                intentionType === 'intentional' && styles.selectedOption,
              ]}
              onPress={() => setIntentionType('intentional')}
            >
              <Text
                style={[
                  styles.intentionOptionText,
                  intentionType === 'intentional' && styles.selectedOptionText,
                ]}
              >
                Intentional
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.intentionOption,
                intentionType === 'automatic' && styles.selectedOption,
              ]}
              onPress={() => setIntentionType('automatic')}
            >
              <Text
                style={[
                  styles.intentionOptionText,
                  intentionType === 'automatic' && styles.selectedOptionText,
                ]}
              >
                Automatic
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Add Cancel Footer */}
      <CancelFooter onCancel={() => {
        // Reset form data when cancelling
        updateFormData({
          urgeStrength: undefined,
          intentionType: undefined
        });
      }} />
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  strengthOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strengthOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#2a9d8f',
    borderColor: '#2a9d8f',
  },
  strengthOptionText: {
    textAlign: 'center',
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  strengthLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  strengthLabel: {
    color: '#666',
    fontSize: 14,
  },
  intentionOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intentionOption: {
    flex: 1,
    marginHorizontal: 5,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intentionOptionText: {
    textAlign: 'center',
    fontSize: 16,
  },
  // New styles for presets section
  presetsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  emptyPresetsText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 12,
  },
  newPresetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  newPresetButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
