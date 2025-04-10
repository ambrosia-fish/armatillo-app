import React, { useState } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { useFormContext } from '@/app/context/FormContext';
import theme from '@/app/constants/theme';

// Urge strength levels
const urgeStrengthLevels = [
  { id: '1', value: 1, label: '1', description: 'Very Mild' },
  { id: '2', value: 2, label: '2', description: 'Mild' },
  { id: '3', value: 3, label: '3', description: 'Mild' },
  { id: '4', value: 4, label: '4', description: 'Moderate' },
  { id: '5', value: 5, label: '5', description: 'Moderate' },
  { id: '6', value: 6, label: '6', description: 'Moderate' },
  { id: '7', value: 7, label: '7', description: 'Strong' },
  { id: '8', value: 8, label: '8', description: 'Strong' },
  { id: '9', value: 9, label: '9', description: 'Very Strong' },
  { id: '10', value: 10, label: '10', description: 'Very Strong' },
];

// Intention types
const intentionTypes = [
  { id: 'automatic', label: 'Automatic', description: 'Without thinking or awareness' },
  { id: 'intentional', label: 'Intentional', description: 'With awareness/conscious intent' },
];

export default function UrgeScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default selections
  const [urgeStrength, setUrgeStrength] = useState<string>(
    formData.urgeStrength ? formData.urgeStrength.toString() : '5'
  );
  
  const [intentionType, setIntentionType] = useState<string>(
    formData.intentionType || 'automatic'
  );
  
  // Handle continue button
  const handleContinue = async () => {
    // Update form data
    updateFormData({
      urgeStrength: parseInt(urgeStrength, 10),
      intentionType: intentionType
    });
    
    // Securely store urge data
    try {
      const urgeData = JSON.stringify({
        urgeStrength: parseInt(urgeStrength, 10),
        intentionType: intentionType
      });
      await SecureStore.setItemAsync('bfrb_urge_data', urgeData);
    } catch (error) {
      console.error('Error storing urge data:', error);
    }
    
    // Navigate to next screen
    router.push('/screens/tracking/environment-screen');
  };
  
  // Get appropriate button style for urge strength - only color buttons up to selected level
  const getUrgeButtonStyle = (value: number) => {
    const selected = parseInt(urgeStrength, 10);
    
    if (value > selected) {
      // Empty/unfilled for buttons to the right of selection
      return { 
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#dddddd'
      };
    } else {
      // Orange gradient with increasing opacity for buttons up to selection
      const opacity = 0.3 + ((value / 10) * 0.7); // Opacity from 0.3 to 1.0
      return { 
        backgroundColor: `rgba(231, 111, 81, ${opacity})` // Orange color with variable opacity
      };
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How strong was the urge?</Text>
          <Text style={styles.cardDescription}>
            Rate the strength of your urge/compulsion before the BFRB.
          </Text>
          
          {/* Urge Strength Scale */}
          <View style={styles.urgeContainer}>
            <View style={styles.urgeLabels}>
              <Text style={styles.urgeEndLabel}>Low</Text>
              <Text style={styles.urgeEndLabel}>High</Text>
            </View>
            <View style={styles.urgeScale}>
              {urgeStrengthLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.urgeButton,
                    getUrgeButtonStyle(level.value),
                    urgeStrength === level.id && styles.urgeButtonSelected
                  ]}
                  onPress={() => setUrgeStrength(level.id)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Urge strength level ${level.value}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: urgeStrength === level.id }}
                />
              ))}
            </View>
            <Text style={styles.selectedUrgeText}>
              {parseInt(urgeStrength) ? `${urgeStrength} - ${urgeStrengthLevels.find(l => l.id === urgeStrength)?.description || 'Medium'} urge` : 'Select strength'}
            </Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Was it automatic or intentional?</Text>
          <Text style={styles.cardDescription}>
            Did you engage in the behavior automatically (without thinking) or intentionally (with awareness)?
          </Text>
          
          {/* Intention Type Options */}
          <View style={styles.intentionContainer}>
            {intentionTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.intentionButton,
                  intentionType === type.id && styles.intentionButtonSelected
                ]}
                onPress={() => setIntentionType(type.id)}
                activeOpacity={0.7}
                accessibilityLabel={type.label}
                accessibilityRole="button"
                accessibilityState={{ selected: intentionType === type.id }}
              >
                <Text style={[
                  styles.intentionLabel,
                  intentionType === type.id && styles.intentionLabelSelected
                ]}>
                  {type.label}
                </Text>
                <Text style={[
                  styles.intentionDescription,
                  intentionType === type.id && styles.intentionDescriptionSelected
                ]}>
                  {type.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  urgeContainer: {
    marginVertical: 8,
  },
  urgeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  urgeEndLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  urgeScale: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
  },
  urgeButton: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 4,
  },
  urgeButtonSelected: {
    borderWidth: 2,
    borderColor: theme.colors.text.primary,
  },
  selectedUrgeText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    color: theme.colors.text.primary,
  },
  intentionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  intentionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
  },
  intentionButtonSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  intentionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  intentionLabelSelected: {
    color: theme.colors.primary.contrast,
  },
  intentionDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  intentionDescriptionSelected: {
    color: theme.colors.primary.contrast,
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
