import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Text, Button, CancelFooter } from '@/app/components';
import { useFormContext } from '@/app/context/FormContext';
import theme from '@/app/constants/theme';

export default function StrengthScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default to middle value (5) if not set
  const [urgeStrength, setUrgeStrength] = useState<number>(
    formData.urgeStrength || 5
  );
  
  // Default to "automatic" if not set
  const [intentionType, setIntentionType] = useState<string>(
    formData.intentionType || 'automatic'
  );
  
  // Handle slider value change
  const handleStrengthSelect = (value: number) => {
    setUrgeStrength(value);
  };
  
  // Handle intention type selection
  const handleIntentionTypeSelect = (type: string) => {
    setIntentionType(type);
  };
  
  // Handle continue button
  const handleContinue = () => {
    // Update form data with urge strength and intention type
    updateFormData({
      urgeStrength,
      intentionType
    });
    
    // Navigate to next screen with updated path
    router.push('/screens/tracking/environment-screen');
  };
  
  // Get description text based on strength value
  const getStrengthDescription = (value: number) => {
    if (value <= 3) {
      return 'Mild urge';
    } else if (value <= 6) {
      return 'Moderate urge';
    } else {
      return 'Strong urge';
    }
  };
  
  // Get color based on strength value
  const getStrengthColor = (value: number) => {
    if (value <= 3) {
      return theme.colors.status.low;
    } else if (value <= 6) {
      return theme.colors.status.medium;
    } else {
      return theme.colors.status.high;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Button 
          onPress={() => router.back()} 
          variant="icon" 
          icon="x" 
          style={styles.closeButton}
        />
        <Text style={styles.headerTitle}>Urge & Intention</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How strong was the urge?</Text>
          <Text style={styles.sectionDescription}>
            Rate the strength of your urge/compulsion before the BFRB.
          </Text>
          
          <View style={styles.strengthMeter}>
            <View style={styles.strengthLabels}>
              <Text style={styles.strengthLabel}>Low</Text>
              <Text style={styles.strengthValue}>
                {urgeStrength} - {getStrengthDescription(urgeStrength)}
              </Text>
              <Text style={styles.strengthLabel}>High</Text>
            </View>
            
            <View style={styles.strengthSlider}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.strengthOption,
                    { 
                      backgroundColor: value <= urgeStrength 
                        ? getStrengthColor(value) 
                        : theme.colors.neutral.light 
                    }
                  ]}
                  onPress={() => handleStrengthSelect(value)}
                />
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Was it automatic or intentional?</Text>
          <Text style={styles.sectionDescription}>
            Did you engage in the behavior automatically (without thinking) or intentionally (with awareness)?
          </Text>
          
          <View style={styles.intentionOptions}>
            <TouchableOpacity
              style={[
                styles.intentionOption,
                intentionType === 'automatic' && styles.intentionOptionSelected
              ]}
              onPress={() => handleIntentionTypeSelect('automatic')}
            >
              <Text style={[
                styles.intentionText,
                intentionType === 'automatic' && styles.intentionTextSelected
              ]}>
                Automatic
              </Text>
              <Text style={styles.intentionDescription}>
                Without thinking or awareness
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.intentionOption,
                intentionType === 'intentional' && styles.intentionOptionSelected
              ]}
              onPress={() => handleIntentionTypeSelect('intentional')}
            >
              <Text style={[
                styles.intentionText,
                intentionType === 'intentional' && styles.intentionTextSelected
              ]}>
                Intentional
              </Text>
              <Text style={styles.intentionDescription}>
                With awareness/conscious intent
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
  } as TextStyle,
  closeButton: {
    padding: 0,
  } as ViewStyle,
  placeholder: {
    width: 24, // Same width as the close button for balanced header
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
  strengthMeter: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  strengthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  strengthLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  } as TextStyle,
  strengthValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
  } as TextStyle,
  strengthSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 30,
  } as ViewStyle,
  strengthOption: {
    flex: 1,
    height: 30,
    marginHorizontal: 2,
    borderRadius: theme.borderRadius.sm,
  } as ViewStyle,
  intentionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  } as ViewStyle,
  intentionOption: {
    flex: 1,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
  } as ViewStyle,
  intentionOptionSelected: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light + '20', // 20% opacity
  } as ViewStyle,
  intentionText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  intentionTextSelected: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle,
  intentionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
