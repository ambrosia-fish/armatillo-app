import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextStyle, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Header, Card, Button } from './components';
import CancelFooter from './components/CancelFooter';
import { useFormContext } from './context/FormContext';
import theme from './constants/theme';

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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header 
        title="About the Instance"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
        rightText="Next"
        onRightPress={handleNext}
      />
      
      <ScrollView style={styles.content}>
        {/* Presets Section */}
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Presets</Text>
          <Text style={styles.cardSubtitle}>Save time by using common patterns</Text>
          
          <View style={styles.presetsContainer}>
            <Text style={styles.emptyPresetsText}>No presets available yet</Text>
            <Button 
              title="+ New Preset"
              variant="text"
              size="small"
              disabled={true}
              onPress={() => {}}
              style={styles.newPresetButton}
            />
          </View>
        </Card>
        
        {/* Urge Strength Section */}
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>How strong was the urge?</Text>
          <View style={styles.strengthOptionsContainer}>
            {renderStrengthOptions()}
          </View>
          <View style={styles.strengthLabelsContainer}>
            <Text style={styles.strengthLabel}>Mild</Text>
            <Text style={styles.strengthLabel}>Strong</Text>
          </View>
        </Card>
        
        {/* Intention Type Section */}
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Was it intentional or automatic?</Text>
          <View style={styles.intentionOptionsContainer}>
            <Card
              containerStyle={[
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
            </Card>
            <Card
              containerStyle={[
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
            </Card>
          </View>
        </Card>
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
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  } as ViewStyle,
  card: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  } as ViewStyle,
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  } as TextStyle,
  cardSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  strengthOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  strengthOption: {
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  selectedOption: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  } as ViewStyle,
  strengthOptionText: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  } as TextStyle,
  selectedOptionText: {
    color: theme.colors.primary.contrast,
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle,
  strengthLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  } as ViewStyle,
  strengthLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  } as TextStyle,
  intentionOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  intentionOption: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  intentionOptionText: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  } as TextStyle,
  presetsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
  } as ViewStyle,
  emptyPresetsText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  newPresetButton: {
    marginTop: theme.spacing.xs,
  } as ViewStyle,
});
