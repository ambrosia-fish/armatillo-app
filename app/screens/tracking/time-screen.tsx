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

// Time options
const timeOptions = [
  { id: 'now', label: 'Now' },
  { id: '15m', label: '15m ago' },
  { id: '30m', label: '30m ago' },
  { id: '1hr', label: '1hr ago' },
];

// Duration options
const durationOptions = [
  { id: '1m', label: '1m', value: 1 },
  { id: '5m', label: '5m', value: 5 },
  { id: '10m', label: '10m', value: 10 },
  { id: '15m', label: '15m', value: 15 },
];

export default function TimeScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Calculate time from selection
  const getTimeFromSelection = (selection: string): Date => {
    const now = new Date();
    
    switch (selection) {
      case 'now':
        return now;
      case '15m':
        return new Date(now.getTime() - 15 * 60 * 1000);
      case '30m':
        return new Date(now.getTime() - 30 * 60 * 1000);
      case '1hr':
        return new Date(now.getTime() - 60 * 60 * 1000);
      default:
        return now;
    }
  };
  
  // Default selections
  const [selectedTime, setSelectedTime] = useState<string>(
    formData.selectedTime || 'now'
  );
  
  const [selectedDuration, setSelectedDuration] = useState<string>(
    formData.selectedDuration || '5m'
  );
  
  const getDurationValue = (selection: string): number => {
    const option = durationOptions.find(opt => opt.id === selection);
    return option ? option.value : 5; // Default to 5 minutes
  };
  
  // Handle continue button
  const handleContinue = async () => {
    // Calculate actual time and duration
    const timeValue = getTimeFromSelection(selectedTime);
    const durationValue = getDurationValue(selectedDuration);
    
    // Update form data with selected values and calculated time
    updateFormData({
      selectedTime,
      selectedDuration,
      time: timeValue,
      duration: durationValue
    });
    
    // Securely store time data
    try {
      const timeData = JSON.stringify({
        timestamp: timeValue.toISOString(),
        duration: durationValue
      });
      await SecureStore.setItemAsync('bfrb_time_data', timeData);
    } catch (error) {
      console.error('Error storing time data:', error);
    }
    
    // Navigate to next screen
    router.push('/screens/tracking/urge-screen');
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
          <Text style={styles.cardTitle}>When did it happen?</Text>
          <Text style={styles.cardDescription}>
            Please select the approximate time when the BFRB instance occurred.
          </Text>
          
          {/* Time Options Grid */}
          <View style={styles.optionsGrid}>
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.timeOptionButton,
                  selectedTime === option.id && styles.timeOptionButtonSelected
                ]}
                onPress={() => setSelectedTime(option.id)}
                activeOpacity={0.7}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedTime === option.id }}
              >
                <Text style={[
                  styles.timeOptionText,
                  selectedTime === option.id && styles.timeOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How long did it last?</Text>
          <Text style={styles.cardDescription}>
            Please select the approximate duration of the BFRB instance.
          </Text>
          
          {/* Duration Options Grid */}
          <View style={styles.optionsGrid}>
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.timeOptionButton,
                  selectedDuration === option.id && styles.timeOptionButtonSelected
                ]}
                onPress={() => setSelectedDuration(option.id)}
                activeOpacity={0.7}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedDuration === option.id }}
              >
                <Text style={[
                  styles.timeOptionText,
                  selectedDuration === option.id && styles.timeOptionTextSelected
                ]}>
                  {option.label}
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  timeOptionButton: {
    flex: 1,
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%',
  },
  timeOptionButtonSelected: {
    backgroundColor: theme.colors.primary.main,
  },
  timeOptionText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  timeOptionTextSelected: {
    color: theme.colors.primary.contrast,
    fontWeight: 'bold',
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
