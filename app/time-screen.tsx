import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Platform, ViewStyle, TextStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Header, Button, Card } from './components';
import { useFormContext } from './context/FormContext';
import CancelFooter from './components/CancelFooter';
import theme from './constants/theme';

interface TimeOption {
  label: string;
  value: number;
}

export default function TimeScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  const now = new Date();
  
  // UI state
  const [customTime, setCustomTime] = useState(formData.customTime || false);
  const [selectedTimeAgo, setSelectedTimeAgo] = useState<number>(formData.selectedTimeAgo || 0);
  const [selectedDuration, setSelectedDuration] = useState<number>(formData.selectedDuration || 1);
  
  // Time options - simplified
  const timeAgoOptions: TimeOption[] = [
    { label: 'Just now', value: 0 },
    { label: '15 min ago', value: 15 },
    { label: '30 min ago', value: 30 },
    { label: '1 hour ago', value: 60 },
    { label: '2 hours ago', value: 120 },
  ];
  
  // Duration options - simplified
  const durationOptions: TimeOption[] = [
    { label: '1 min', value: 1 },
    { label: '2 min', value: 2 },
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
  ];

  const handleSave = () => {
    // Calculate final time
    let finalTime = new Date();
    finalTime.setMinutes(finalTime.getMinutes() - selectedTimeAgo);
    
    // Save data to context
    updateFormData({
      time: finalTime,
      duration: selectedDuration,
      customTime,
      selectedTimeAgo,
      selectedDuration
    });
    
    // Navigate to next screen
    router.push('/strength-screen');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <Header 
        title="When did it happen?"
        leftIcon="close"
        onLeftPress={() => router.back()}
        rightText="Next"
        onRightPress={handleSave}
      />
      
      <ScrollView style={styles.content}>
        <Card containerStyle={styles.optionsCard}>
          <Text style={styles.cardTitle}>Time</Text>
          
          {timeAgoOptions.map((option) => (
            <Card
              key={option.value}
              containerStyle={[
                styles.optionButton,
                selectedTimeAgo === option.value && styles.selectedOption
              ]}
              onPress={() => setSelectedTimeAgo(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedTimeAgo === option.value && styles.selectedOptionText
                ]}
              >
                {option.label}
              </Text>
            </Card>
          ))}
        </Card>

        <Card containerStyle={styles.optionsCard}>
          <Text style={styles.cardTitle}>Duration</Text>
          
          {durationOptions.map((option) => (
            <Card
              key={option.value}
              containerStyle={[
                styles.optionButton,
                selectedDuration === option.value && styles.selectedOption
              ]}
              onPress={() => setSelectedDuration(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedDuration === option.value && styles.selectedOptionText
                ]}
              >
                {option.label}
              </Text>
            </Card>
          ))}
        </Card>
      </ScrollView>
      
      <StatusBar style="auto" />

      <CancelFooter onCancel={() => {
        updateFormData({
          time: undefined,
          duration: undefined
        });
      }} />
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
  optionsCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  } as ViewStyle,
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  } as TextStyle,
  optionButton: {
    marginVertical: theme.spacing.xs,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  } as ViewStyle,
  selectedOption: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  } as ViewStyle,
  optionText: {
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    color: theme.colors.text.primary,
  } as TextStyle,
  selectedOptionText: {
    color: theme.colors.primary.contrast,
    fontWeight: theme.typography.fontWeight.bold as '700',
  } as TextStyle
});
