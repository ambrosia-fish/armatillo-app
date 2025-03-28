import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Platform,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

import { useFormContext } from '@/app/context/FormContext';
import theme from '@/app/constants/theme';

// Time options
const timeOptions = [
  { id: 'now', label: 'Now' },
  { id: '15m', label: '15m ago' },
  { id: '30m', label: '30m ago' },
  { id: '1hr', label: '1hr ago' },
  { id: '2hr', label: '2hrs ago' },
  { id: 'custom', label: 'Custom' },
];

// Duration options
const durationOptions = [
  { id: '1m', label: '1m', value: 1 },
  { id: '5m', label: '5m', value: 5 },
  { id: '10m', label: '10m', value: 10 },
  { id: '15m', label: '15m', value: 15 },
  { id: '30m', label: '30m', value: 30 },
  { id: 'custom', label: 'Custom', value: 0 },
];

export default function TimeScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // States for modal visibility
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  
  // States for custom time and duration inputs
  const [customTime, setCustomTime] = useState(new Date());
  const [customDuration, setCustomDuration] = useState('');
  const [customTimeSelected, setCustomTimeSelected] = useState(false);
  const [customDurationSelected, setCustomDurationSelected] = useState(false);
  const [customDurationValue, setCustomDurationValue] = useState('5'); // Changed to string type
  
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
      case '2hr':
        return new Date(now.getTime() - 120 * 60 * 1000);
      case 'custom':
        return customTime;
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
    if (selection === 'custom') {
      return Platform.OS === 'ios' 
        ? parseInt(customDurationValue) || 0 
        : parseInt(customDuration) || 0;
    }
    
    const option = durationOptions.find(opt => opt.id === selection);
    return option ? option.value : 5; // Default to 5 minutes
  };
  
  // Handle time option selection
  const handleTimeSelection = (id: string) => {
    setSelectedTime(id);
    if (id === 'custom') {
      setTimeModalVisible(true);
    }
  };
  
  // Handle duration option selection
  const handleDurationSelection = (id: string) => {
    setSelectedDuration(id);
    if (id === 'custom') {
      setDurationModalVisible(true);
    }
  };
  
  // Handle custom time confirmation
  const handleCustomTimeConfirm = () => {
    setCustomTimeSelected(true);
    setTimeModalVisible(false);
  };
  
  // Handle custom duration confirmation
  const handleCustomDurationConfirm = () => {
    setCustomDurationSelected(true);
    setDurationModalVisible(false);
  };

  // Get display label for time option
  const getTimeLabel = (option) => {
    if (option.id === 'custom' && customTimeSelected) {
      return customTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return option.label;
  };

  // Get display label for duration option
  const getDurationLabel = (option) => {
    if (option.id === 'custom' && customDurationSelected) {
      const minutes = Platform.OS === 'ios' ? parseInt(customDurationValue) : parseInt(customDuration);
      return `${minutes}m`;
    }
    return option.label;
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
                onPress={() => handleTimeSelection(option.id)}
                activeOpacity={0.7}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedTime === option.id }}
              >
                <Text style={[
                  styles.timeOptionText,
                  selectedTime === option.id && styles.timeOptionTextSelected
                ]}>
                  {getTimeLabel(option)}
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
                onPress={() => handleDurationSelection(option.id)}
                activeOpacity={0.7}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedDuration === option.id }}
              >
                <Text style={[
                  styles.timeOptionText,
                  selectedDuration === option.id && styles.timeOptionTextSelected
                ]}>
                  {getDurationLabel(option)}
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
      
      {/* Custom Time Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={timeModalVisible}
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Custom Time</Text>
            
            <Text style={styles.modalLabel}>Select time today:</Text>
            {Platform.OS === 'ios' ? (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  testID="timePicker"
                  value={customTime}
                  mode="time"
                  is24Hour={false}
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    const currentDate = selectedDate || customTime;
                    setCustomTime(currentDate);
                  }}
                  style={styles.iosPicker}
                />
              </View>
            ) : (
              <DateTimePicker
                testID="timePicker"
                value={customTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || customTime;
                  setCustomTime(currentDate);
                }}
              />
            )}
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setTimeModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleCustomTimeConfirm}
              >
                <Text style={styles.modalConfirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Custom Duration Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={durationModalVisible}
        onRequestClose={() => setDurationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Custom Duration</Text>
            
            <Text style={styles.modalLabel}>Duration (minutes):</Text>
            {Platform.OS === 'ios' ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={customDurationValue}
                  onValueChange={(itemValue) => setCustomDurationValue(itemValue)}
                  itemStyle={styles.pickerItem}
                  style={styles.iosPicker}
                >
                  {Array.from({ length: 120 }, (_, i) => i + 1).map((value) => (
                    <Picker.Item key={value} label={`${value} minute${value > 1 ? 's' : ''}`} value={String(value)} />
                  ))}
                </Picker>
              </View>
            ) : (
              <TextInput
                style={styles.customDurationInput}
                keyboardType="numeric"
                value={customDuration}
                onChangeText={setCustomDuration}
                placeholder="Enter minutes"
                maxLength={3}
              />
            )}
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setDurationModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleCustomDurationConfirm}
              >
                <Text style={styles.modalConfirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginHorizontal: -6,
    justifyContent: 'space-between',
    gap: 12,
  },
  timeOptionButton: {
    width: '45%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    ...theme.shadows.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  iosPicker: {
    width: '100%',
    height: 150,
  },
  pickerItem: {
    fontSize: 18,
  },
  timeInputButton: {
    borderWidth: 1,
    borderColor: theme.colors.border.main,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  timeInputButtonText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  customDurationInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.main,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.background.secondary,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  modalConfirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary.main,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: 14,
    fontWeight: 'bold',
  },
});