import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, ViewStyle, TextStyle, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Text, View, Button, Card, Header, CancelFooter } from '@/app/components';
import { useFormContext } from '@/app/context/FormContext';
import theme from '@/app/constants/theme';

// When did it happen options: relative times in minutes
const timeOptions = [
  { label: 'Now', value: 0 },
  { label: '15m ago', value: 15 },
  { label: '30m ago', value: 30 },
  { label: '1hr ago', value: 60 },
  { label: '2hrs ago', value: 120 },
  { label: '3hrs ago', value: 180 },
  { label: '6hrs ago', value: 360 },
  { label: '12hrs ago', value: 720 },
  { label: 'Yesterday', value: 1440 }, // 24 hours ago
];

// Duration options in minutes
const durationOptions = [
  { label: '1m', value: 1 },
  { label: '5m', value: 5 },
  { label: '10m', value: 10 },
  { label: '15m', value: 15 },
  { label: '20m', value: 20 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1hr', value: 60 },
  { label: '2hrs', value: 120 },
];

export default function TimeScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Calculate time based on minutes ago from now
  const getTimeFromMinutesAgo = (minutesAgo: number): Date => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - minutesAgo);
    return date;
  };

  // Default to "now" if not set
  const [selectedTimeOptionIndex, setSelectedTimeOptionIndex] = useState(
    timeOptions.findIndex(option => 
      option.value === 0
    ) || 0
  );
  
  // Duration in minutes, default to 5 minutes if not set
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(
    durationOptions.findIndex(option => 
      option.value === (formData.duration as number || 5)
    ) || 1 // Default to 5 minutes (index 1)
  );
  
  // Handle continue button
  const handleContinue = () => {
    // Get the selected time based on minutes ago
    const eventTime = getTimeFromMinutesAgo(timeOptions[selectedTimeOptionIndex].value);
    
    // Update form data with time and duration
    updateFormData({
      time: eventTime,
      duration: durationOptions[selectedDurationIndex].value
    });
    
    // Navigate to next screen with updated path
    router.push('/screens/tracking/strength-screen');
  };

  // Render option buttons in a grid
  const renderOptionButtons = (
    options: { label: string; value: number }[],
    selectedIndex: number,
    onSelect: (index: number) => void
  ) => {
    return (
      <View style={styles.optionsGrid}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedIndex === index && styles.selectedOptionButton
            ]}
            onPress={() => onSelect(index)}
          >
            <Text 
              style={[
                styles.optionButtonText,
                selectedIndex === index && styles.selectedOptionButtonText
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      
      <Header 
        title="Time & Duration" 
        leftIcon="close"
        onLeftPress={() => router.back()}
      />
      
      <ScrollView style={styles.content}>
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>When did it happen?</Text>
          <Text style={styles.cardDescription}>
            Please select the approximate time when the BFRB instance occurred.
          </Text>
          
          {renderOptionButtons(
            timeOptions,
            selectedTimeOptionIndex,
            (index) => setSelectedTimeOptionIndex(index)
          )}
        </Card>
        
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>How long did it last?</Text>
          <Text style={styles.cardDescription}>
            Please select the approximate duration of the BFRB instance.
          </Text>
          
          {renderOptionButtons(
            durationOptions,
            selectedDurationIndex,
            (index) => setSelectedDurationIndex(index)
          )}
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

// Calculate the width for 3 buttons per row with spacing
const screenWidth = Dimensions.get('window').width;
const buttonWidth = (screenWidth - (theme.spacing.lg * 2) - (theme.spacing.lg * 2) - (theme.spacing.md * 2)) / 3;

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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  } as ViewStyle,
  optionButton: {
    width: buttonWidth,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  selectedOptionButton: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.dark,
  } as ViewStyle,
  optionButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  } as TextStyle,
  selectedOptionButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold as '700',
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
