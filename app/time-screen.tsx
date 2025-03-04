import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

// Define time option interface
interface TimeOption {
  label: string;
  value: number; // minutes ago
}

export default function TimeScreen() {
  const router = useRouter();
  
  // UI state
  const [customTime, setCustomTime] = useState(false);
  const [selectedTimeAgo, setSelectedTimeAgo] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  
  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customDate, setCustomDate] = useState(new Date());
  
  // Duration picker state
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(15);
  
  // Predefined options
  const timeAgoOptions: TimeOption[] = [
    { label: 'Just happened', value: 0 },
    { label: '15 minutes ago', value: 15 },
    { label: '30 minutes ago', value: 30 },
    { label: '45 minutes ago', value: 45 },
    { label: '1 hour ago', value: 60 },
    { label: '1.5 hours ago', value: 90 },
    { label: '2 hours ago', value: 120 },
    { label: 'Custom time', value: -1 },
  ];
  
  const durationOptions: number[] = [1, 2, 3, 5, 10, 15, 20];

  // Event handlers
  const handleSave = () => {
    let timeAgoValue = selectedTimeAgo;
    let finalDuration = selectedDuration;
    
    // Calculate custom time if selected
    if (selectedTimeAgo === -1) {
      const now = new Date();
      const diffMs = now.getTime() - customDate.getTime();
      timeAgoValue = Math.round(diffMs / 60000); // Convert ms to minutes
      
      // If the time is in the future, assume it's from yesterday
      if (timeAgoValue < 0) {
        timeAgoValue += 24 * 60; // Add 24 hours in minutes
      }
    }
    
    // Calculate custom duration if selected
    if (selectedDuration === -1) {
      finalDuration = (durationHours * 60) + durationMinutes;
    }
    
    console.log('Saving time data:', { 
      timeAgo: timeAgoValue, 
      duration: finalDuration
    });
    
    router.back();
  };

  const handleTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || customDate;
    setShowTimePicker(Platform.OS === 'ios');
    setCustomDate(currentDate);
  };

  const handleDurationChange = (field, value) => {
    if (field === 'hours') {
      setDurationHours(value);
    } else {
      setDurationMinutes(value);
    }
  };

  const handleCustomTimeSelection = () => {
    setSelectedTimeAgo(-1);
    setShowTimePicker(true);
  };

  const handleCustomDurationSelection = () => {
    setSelectedDuration(-1);
    setShowDurationPicker(true);
  };

  // Formatter functions
  const formatCustomTime = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateText = '';
    if (customDate.toDateString() === today.toDateString()) {
      dateText = 'Today';
    } else if (customDate.toDateString() === yesterday.toDateString()) {
      dateText = 'Yesterday';
    } else {
      dateText = customDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return `${dateText} ${customDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  };

  const formatCustomDuration = () => {
    if (durationHours === 0) {
      return `${durationMinutes} ${durationMinutes === 1 ? 'minute' : 'minutes'}`;
    } else if (durationMinutes === 0) {
      return `${durationHours} ${durationHours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${durationHours}h ${durationMinutes}m`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>When did it happen?</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Custom time</Text>
          <Switch
            value={customTime}
            onValueChange={setCustomTime}
            trackColor={{ false: '#ccc', true: '#2a9d8f' }}
            thumbColor={customTime ? '#fff' : '#fff'}
          />
        </View>
        
        {!customTime ? (
          <View style={styles.justHappenedContainer}>
            <Text style={styles.justHappenedText}>Just happened</Text>
            <Text style={styles.justHappenedSubtext}>
              Current time will be used for this entry
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>How long ago?</Text>
            <View style={styles.optionsContainer}>
              {timeAgoOptions.slice(0, 7).map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeOption,
                    selectedTimeAgo === option.value && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedTimeAgo(option.value)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      selectedTimeAgo === option.value && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.timeOption,
                  selectedTimeAgo === -1 && styles.selectedOption,
                  { minWidth: '45%' }
                ]}
                onPress={handleCustomTimeSelection}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    selectedTimeAgo === -1 && styles.selectedOptionText,
                  ]}
                >
                  {selectedTimeAgo === -1 ? formatCustomTime() : 'Custom time'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>How long did it last?</Text>
            <View style={styles.optionsContainer}>
              {durationOptions.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.timeOption,
                    selectedDuration === duration && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedDuration(duration)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      selectedDuration === duration && styles.selectedOptionText,
                    ]}
                  >
                    {duration} {duration === 1 ? 'minute' : 'minutes'}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.timeOption,
                  selectedDuration === -1 && styles.selectedOption,
                  { minWidth: '45%' }
                ]}
                onPress={handleCustomDurationSelection}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    selectedDuration === -1 && styles.selectedOptionText,
                  ]}
                >
                  {selectedDuration === -1 ? formatCustomDuration() : 'Custom duration'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
      
      {/* Native Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={customDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          maximumDate={new Date()}
        />
      )}
      
      {/* Native Duration Picker (iOS only) */}
      {showDurationPicker && Platform.OS === 'ios' && (
        <View style={styles.durationPickerContainer}>
          <View style={styles.durationPickerHeader}>
            <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pickerRow}>
            {/* Hours Picker */}
            <View style={styles.pickerColumn}>
              {[...Array(24)].map((_, i) => (
                <TouchableOpacity 
                  key={`hour-${i}`}
                  style={[
                    styles.pickerItem,
                    durationHours === i && styles.selectedPickerItem
                  ]}
                  onPress={() => handleDurationChange('hours', i)}
                >
                  <Text style={styles.pickerText}>{i}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.pickerSeparator}>h</Text>
            
            {/* Minutes Picker */}
            <View style={styles.pickerColumn}>
              {[...Array(60)].map((_, i) => (
                <TouchableOpacity 
                  key={`minute-${i}`}
                  style={[
                    styles.pickerItem,
                    durationMinutes === i && styles.selectedPickerItem
                  ]}
                  onPress={() => handleDurationChange('minutes', i)}
                >
                  <Text style={styles.pickerText}>{i}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.pickerSeparator}>m</Text>
          </View>
        </View>
      )}
      
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#2a9d8f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  justHappenedContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  justHappenedText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  justHappenedSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  timeOption: {
    padding: 12,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#2a9d8f',
    borderColor: '#2a9d8f',
  },
  timeOptionText: {
    textAlign: 'center',
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  durationPickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  durationPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  doneButton: {
    color: '#2a9d8f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerColumn: {
    flex: 1,
    height: 150,
    overflow: 'hidden',
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPickerItem: {
    backgroundColor: '#2a9d8f20',
  },
  pickerText: {
    fontSize: 18,
  },
  pickerSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
    color: '#666',
  }
});