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
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { useFormContext } from '@/app/context/FormContext';
import theme from '@/app/constants/theme';

// Time options
const timeOptions = [
  { id: 'now', label: 'Now' },
  { id: '15m', label: '15m ago' },
  { id: '30m', label: '30m ago' },
  { id: '1hr', label: '1hr ago' },
  { id: '2hrs', label: '2hrs ago' },
  { id: '3hrs', label: '3hrs ago' },
  { id: '6hrs', label: '6hrs ago' },
  { id: '12hrs', label: '12hrs ago' },
  { id: 'yesterday', label: 'Yesterday' },
];

// Duration options
const durationOptions = [
  { id: '1m', label: '1m', value: 1 },
  { id: '5m', label: '5m', value: 5 },
  { id: '10m', label: '10m', value: 10 },
  { id: '15m', label: '15m', value: 15 },
  { id: '20m', label: '20m', value: 20 },
  { id: '30m', label: '30m', value: 30 },
  { id: '45m', label: '45m', value: 45 },
  { id: '1hr', label: '1hr', value: 60 },
  { id: '2hr', label: '2hr+', value: 120 },
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
      case '2hrs':
        return new Date(now.getTime() - 2 * 60 * 60 * 1000);
      case '3hrs':
        return new Date(now.getTime() - 3 * 60 * 60 * 1000);
      case '6hrs':
        return new Date(now.getTime() - 6 * 60 * 60 * 1000);
      case '12hrs':
        return new Date(now.getTime() - 12 * 60 * 60 * 1000);
      case 'yesterday':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
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
        
        <Text style={styles.headerTitle}>Time & Duration</Text>
        
        <View style={styles.headerRight} />
      </View>
      
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
                  styles.optionButton,
                  selectedTime === option.id && styles.optionButtonSelected
                ]}
                onPress={() => setSelectedTime(option.id)}
                activeOpacity={0.7}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedTime === option.id }}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedTime === option.id && styles.optionButtonTextSelected
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
                  styles.optionButton,
                  selectedDuration === option.id && styles.optionButtonSelected
                ]}
                onPress={() => setSelectedDuration(option.id)}
                activeOpacity={0.7}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedDuration === option.id }}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedDuration === option.id && styles.optionButtonTextSelected
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
    marginVertical: -4,
  },
  optionButton: {
    flex: 1,
    minWidth: '33%',
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.primary.main,
  },
  optionButtonText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  optionButtonTextSelected: {
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
