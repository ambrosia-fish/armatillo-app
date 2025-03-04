import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform, PanResponder } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  
  // Custom time picker state
  const [timeHour, setTimeHour] = useState(new Date().getHours());
  const [timeMinute, setTimeMinute] = useState(0);
  const [timeAMPM, setTimeAMPM] = useState(new Date().getHours() >= 12 ? 'PM' : 'AM');
  
  // Duration picker state
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(15);
  
  // Time ago options in 15-minute increments
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
  
  // Duration options in minutes
  const durationOptions: number[] = [1, 2, 3, 5, 10, 15, 20];

  // Create Pan Responders for swipe gestures
  const hourPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Detect vertical swipes
        if (Math.abs(gestureState.dy) > 10) {
          if (gestureState.dy < 0) {
            // Swipe up - increment hour
            handleTimeHourChange(timeHour + 1);
          } else {
            // Swipe down - decrement hour
            handleTimeHourChange(timeHour - 1);
          }
          return true;
        }
        return false;
      },
      onPanResponderRelease: () => {}
    })
  ).current;

  const minutePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Detect vertical swipes
        if (Math.abs(gestureState.dy) > 10) {
          if (gestureState.dy < 0) {
            // Swipe up - increment minute
            handleTimeMinuteChange(timeMinute + 5);
          } else {
            // Swipe down - decrement minute
            handleTimeMinuteChange(timeMinute - 5);
          }
          return true;
        }
        return false;
      },
      onPanResponderRelease: () => {}
    })
  ).current;

  const ampmPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dy) > 10) {
          toggleAMPM();
          return true;
        }
        return false;
      },
      onPanResponderRelease: () => {}
    })
  ).current;

  const durationHoursPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dy) > 10) {
          if (gestureState.dy < 0) {
            handleDurationHourChange(durationHours + 1);
          } else {
            handleDurationHourChange(durationHours - 1);
          }
          return true;
        }
        return false;
      },
      onPanResponderRelease: () => {}
    })
  ).current;

  const durationMinutesPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dy) > 10) {
          if (gestureState.dy < 0) {
            handleDurationMinuteChange(durationMinutes + 5);
          } else {
            handleDurationMinuteChange(durationMinutes - 5);
          }
          return true;
        }
        return false;
      },
      onPanResponderRelease: () => {}
    })
  ).current;

  const handleSave = () => {
    // Save the time data and proceed to the next screen
    let timeAgoValue = selectedTimeAgo;
    let finalDuration = selectedDuration;
    
    // If custom time was selected, calculate minutes ago
    if (selectedTimeAgo === -1) {
      const now = new Date();
      const customTime = new Date();
      
      // Set the hours and minutes based on picker values
      let hours = timeHour;
      if (timeAMPM === 'PM' && hours < 12) hours += 12;
      if (timeAMPM === 'AM' && hours === 12) hours = 0;
      
      customTime.setHours(hours, timeMinute, 0, 0);
      
      // Calculate difference in minutes
      const diffMs = now.getTime() - customTime.getTime();
      timeAgoValue = Math.round(diffMs / 60000); // Convert ms to minutes
      
      // If the time is in the future, assume it's from yesterday
      if (timeAgoValue < 0) {
        timeAgoValue += 24 * 60; // Add 24 hours in minutes
      }
    }
    
    // If custom duration was selected, calculate duration in minutes
    if (selectedDuration === -1) {
      finalDuration = (durationHours * 60) + durationMinutes;
    }
    
    console.log('Saving time data:', { 
      timeAgo: timeAgoValue, 
      duration: finalDuration,
      customTimeHour: selectedTimeAgo === -1 ? timeHour : null,
      customTimeMinute: selectedTimeAgo === -1 ? timeMinute : null,
      customTimeAMPM: selectedTimeAgo === -1 ? timeAMPM : null,
      customDurationHours: selectedDuration === -1 ? durationHours : null,
      customDurationMinutes: selectedDuration === -1 ? durationMinutes : null
    });
    
    // Logic to save time info would go here
    
    // Navigate back for now (you can change this to the next screen later)
    router.back();
  };

  const handleTimeHourChange = (value) => {
    let newHour = value;
    if (newHour > 12) newHour = 1;
    if (newHour < 1) newHour = 12;
    setTimeHour(newHour);
  };

  const handleTimeMinuteChange = (value) => {
    let newMinute = value;
    if (newMinute >= 60) newMinute = 0;
    if (newMinute < 0) newMinute = 55;
    setTimeMinute(newMinute);
  };

  const toggleAMPM = () => {
    setTimeAMPM(prev => prev === 'AM' ? 'PM' : 'AM');
  };

  const handleDurationHourChange = (value) => {
    setDurationHours(Math.max(0, Math.min(23, value)));
  };

  const handleDurationMinuteChange = (value) => {
    setDurationMinutes(Math.max(0, Math.min(59, value)));
  };

  const formatCustomTime = () => {
    const hourDisplay = timeHour;
    const minuteDisplay = timeMinute < 10 ? `0${timeMinute}` : timeMinute;
    return `${hourDisplay}:${minuteDisplay} ${timeAMPM}`;
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

  const openTimePicker = () => {
    // Initialize time picker with current time
    const now = new Date();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    
    setTimeHour(hours);
    setTimeMinute(now.getMinutes());
    setTimeAMPM(ampm);
    
    setShowTimePicker(true);
    setShowDurationPicker(false);
  };

  const openDurationPicker = () => {
    setShowDurationPicker(true);
    setShowTimePicker(false);
  };

  const handleCustomTimeSelection = () => {
    setSelectedTimeAgo(-1);
    openTimePicker();
  };

  const handleCustomDurationSelection = () => {
    setSelectedDuration(-1);
    openDurationPicker();
  };

  const handleDurationSelection = (duration) => {
    setSelectedDuration(duration);
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
      
      {!showTimePicker && !showDurationPicker ? (
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
                    onPress={() => handleDurationSelection(duration)}
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
      ) : showTimePicker ? (
        // Custom Time Picker View
        <View style={styles.timePickerFullScreenContainer}>
          <View style={styles.timePickerContent}>
            <Text style={styles.timePickerTitle}>Select exact time</Text>
            
            <View style={styles.durationPickerContainer}>
              {/* Hours picker */}
              <View style={styles.durationPickerColumn}>
                <TouchableOpacity 
                  style={styles.durationPickerButton}
                  onPress={() => handleTimeHourChange(timeHour + 1)}
                >
                  <Ionicons name="chevron-up" size={24} color="#ccc" />
                </TouchableOpacity>
                <View 
                  style={styles.pickerValueContainer}
                  {...hourPanResponder.panHandlers}
                >
                  <Text style={styles.durationPickerValue}>{timeHour}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.durationPickerButton}
                  onPress={() => handleTimeHourChange(timeHour - 1)}
                >
                  <Ionicons name="chevron-down" size={24} color="#ccc" />
                </TouchableOpacity>
                <Text style={styles.durationPickerLabel}>hour</Text>
              </View>
              
              {/* Minutes picker */}
              <View style={styles.durationPickerColumn}>
                <TouchableOpacity 
                  style={styles.durationPickerButton}
                  onPress={() => handleTimeMinuteChange(timeMinute + 5)}
                >
                  <Ionicons name="chevron-up" size={24} color="#ccc" />
                </TouchableOpacity>
                <View 
                  style={styles.pickerValueContainer}
                  {...minutePanResponder.panHandlers}
                >
                  <Text style={styles.durationPickerValue}>{timeMinute < 10 ? `0${timeMinute}` : timeMinute}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.durationPickerButton}
                  onPress={() => handleTimeMinuteChange(timeMinute - 5)}
                >
                  <Ionicons name="chevron-down" size={24} color="#ccc" />
                </TouchableOpacity>
                <Text style={styles.durationPickerLabel}>minute</Text>
              </View>
              
              {/* AM/PM picker */}
              <View style={styles.durationPickerColumn}>
                <TouchableOpacity 
                  style={styles.durationPickerButton}
                  onPress={toggleAMPM}
                >
                  <Ionicons name="chevron-up" size={24} color="#ccc" />
                </TouchableOpacity>
                <View 
                  style={styles.pickerValueContainer}
                  {...ampmPanResponder.panHandlers}
                >
                  <Text style={styles.durationPickerValue}>{timeAMPM}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.durationPickerButton}
                  onPress={toggleAMPM}
                >
                  <Ionicons name="chevron-down" size={24} color="#ccc" />
                </TouchableOpacity>
                <Text style={styles.durationPickerLabel}></Text>
              </View>
            </View>
            
            <View style={styles.timePickerButtonsContainer}>
              <TouchableOpacity 
                style={styles.timePickerButton} 
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.timePickerCancelButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.timePickerButton} 
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.timePickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // Duration Picker View (custom implementation)
        <View style={styles.timePickerFullScreenContainer}>
          <View style={styles.timePickerContent}>
            <Text style={styles.timePickerTitle}>Select duration</Text>
            
            <View style={styles.durationPickerContainer}>
              {/* Hours picker */}
              <View style={styles.durationPickerColumn}>
                <TouchableOpacity 
                  style={styles.durationPickerButton}
                  onPress={() => handleDurationHourChange(durationHours + 1)}
                >
                  <Ionicons name="chevron-up" size={24} color="#ccc" />
                </TouchableOpacity>
                <View 
                  style={styles.pickerValueContainer}
                  {...durationHoursPanResponder.panHandlers}
                >
                  <Text style={styles.durationPickerValue}>{durationHours}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.durationPickerButton}
                  onPress={() => handleDurationHourChange(durationHours - 1)}
                  disabled={durationHours <= 0}
                >
                  <Ionicons name="chevron-down" size={24} color={durationHours > 0 ? "#ccc" : "#eee"} />
                </TouchableOpacity>
                <Text style={styles.durationPickerLabel}>hours</Text>
              </View>
              
              {/* Minutes picker */}
              <View style={styles.durationPickerColumn}>
                <TouchableOpacity 
                  style={styles.durationPickerButton}
                  onPress={() => handleDurationMinuteChange(durationMinutes + 5)}
                >
                  <Ionicons name="chevron-up" size={24} color="#ccc" />
                </TouchableOpacity>
                <View 
                  style={styles.pickerValueContainer}
                  {...durationMinutesPanResponder.panHandlers}
                >
                  <Text style={styles.durationPickerValue}>{durationMinutes}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.durationPickerButton}
                  onPress={() => handleDurationMinuteChange(durationMinutes - 5)}
                  disabled={durationMinutes <= 0}
                >
                  <Ionicons name="chevron-down" size={24} color={durationMinutes > 0 ? "#ccc" : "#eee"} />
                </TouchableOpacity>
                <Text style={styles.durationPickerLabel}>minutes</Text>
              </View>
            </View>
            
            <View style={styles.timePickerButtonsContainer}>
              <TouchableOpacity 
                style={styles.timePickerButton} 
                onPress={() => setShowDurationPicker(false)}
              >
                <Text style={styles.timePickerCancelButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.timePickerButton} 
                onPress={() => setShowDurationPicker(false)}
              >
                <Text style={styles.timePickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
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
  // Picker common styles
  timePickerFullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  timePickerContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  timePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  // Duration picker styles (used for both time and duration)
  durationPickerContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a9d8f10',
    borderRadius: 12,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#2a9d8f30',
  },
  durationPickerColumn: {
    width: 80,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  durationPickerButton: {
    padding: 12,
  },
  pickerValueContainer: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPickerValue: {
    fontSize: 40,
    fontWeight: '500',
    color: '#333',
  },
  durationPickerLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  timePickerButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  timePickerButton: {
    padding: 12,
  },
  timePickerCancelButton: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  timePickerDoneButton: {
    color: '#2a9d8f',
    fontWeight: 'bold',
    fontSize: 16,
  },
});