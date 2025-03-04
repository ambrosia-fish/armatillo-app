import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimeOption {
  label: string;
  value: number; // minutes ago
}

export default function TimeScreen() {
  const router = useRouter();
  const [customTime, setCustomTime] = useState(false);
  const [selectedTimeAgo, setSelectedTimeAgo] = useState<number>(0); // Just happened = 0 minutes ago
  const [selectedDuration, setSelectedDuration] = useState<number>(1); // Default 1 minute
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customDate, setCustomDate] = useState(new Date());
  
  // Time ago options in 15-minute increments
  const timeAgoOptions: TimeOption[] = [
    { label: 'Just happened', value: 0 },
    { label: '15 minutes ago', value: 15 },
    { label: '30 minutes ago', value: 30 },
    { label: '45 minutes ago', value: 45 },
    { label: '1 hour ago', value: 60 },
    { label: '1.5 hours ago', value: 90 },
    { label: '2 hours ago', value: 120 },
    { label: 'Custom', value: -1 },
  ];
  
  // Duration options in minutes
  const durationOptions: number[] = [1, 2, 3, 5, 10, 15, 20, 30];

  const handleSave = () => {
    // Save the time data and proceed to the next screen
    let timeAgoValue = selectedTimeAgo;
    
    // If custom time was selected, calculate minutes ago
    if (selectedTimeAgo === -1) {
      const now = new Date();
      const diffMs = now.getTime() - customDate.getTime();
      timeAgoValue = Math.round(diffMs / 60000); // Convert ms to minutes
    }
    
    console.log('Saving time data:', { 
      timeAgo: timeAgoValue, 
      duration: selectedDuration,
      customDate: selectedTimeAgo === -1 ? customDate : null
    });
    
    // Logic to save time info would go here
    
    // Navigate back for now (you can change this to the next screen later)
    router.back();
  };

  const handleTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || customDate;
    
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    setCustomDate(currentDate);
  };

  const formatCustomTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const openTimePicker = () => {
    if (Platform.OS === 'ios') {
      setShowTimePicker(true);
    } else {
      setShowTimePicker(true);
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
              {timeAgoOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeOption,
                    selectedTimeAgo === option.value && styles.selectedOption,
                  ]}
                  onPress={() => {
                    setSelectedTimeAgo(option.value);
                    if (option.value === -1) {
                      openTimePicker();
                    }
                  }}
                >
                  {option.value === -1 && selectedTimeAgo === -1 ? (
                    <Text
                      style={[
                        styles.timeOptionText,
                        selectedTimeAgo === option.value && styles.selectedOptionText,
                      ]}
                    >
                      {formatCustomTime(customDate)}
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.timeOptionText,
                        selectedTimeAgo === option.value && styles.selectedOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
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
            </View>
          </>
        )}
      </ScrollView>
      
      {/* Time Picker for iOS */}
      {Platform.OS === 'ios' && showTimePicker && (
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerHeader}>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={customDate}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
          />
        </View>
      )}
      
      {/* Time Picker for Android */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={customDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
      
      {/* Use a light status bar on iOS to account for the black space above the modal */}
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
  timePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    color: '#999',
    fontSize: 16,
  },
  doneButton: {
    color: '#2a9d8f',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
