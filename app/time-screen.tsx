import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

interface TimeOption {
  label: string;
  value: number;
}

export default function TimeScreen() {
  const router = useRouter();
  const now = new Date();
  
  // UI state
  const [customTime, setCustomTime] = useState(false);
  const [selectedTimeAgo, setSelectedTimeAgo] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  
  // Custom time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("Today");
  const [selectedHour, setSelectedHour] = useState<string>(String(now.getHours() % 12 || 12));
  const [selectedMinute, setSelectedMinute] = useState<string>(String(now.getMinutes()));
  const [selectedAmPm, setSelectedAmPm] = useState(now.getHours() >= 12 ? 'PM' : 'AM');
  
  // Duration picker state
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [durationHours, setDurationHours] = useState<string>("0");
  const [durationMinutes, setDurationMinutes] = useState<string>("15");
  
  // Time options
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

  // Get date strings for the previous 7 days for the day picker
  const getPreviousDays = () => {
    const days = [];
    const today = new Date();
    
    // Add "Today"
    days.push({ label: "Today", value: "Today" });
    
    // Add "Yesterday"
    days.push({ label: "Yesterday", value: "Yesterday" });
    
    // Add previous 5 days with formatted dates
    for (let i = 2; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ label: formattedDate, value: formattedDate });
    }
    
    return days;
  };

  // Convert selected day string to an actual date offset
  const getDateFromSelectedDay = (dayString: string): Date => {
    const date = new Date();
    
    if (dayString === "Today") {
      // Keep current date
    } else if (dayString === "Yesterday") {
      date.setDate(date.getDate() - 1);
    } else {
      // Parse date from format like "Mar 2"
      const parts = dayString.split(' ');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = monthNames.indexOf(parts[0]);
      const day = parseInt(parts[1], 10);
      
      if (monthIndex >= 0 && !isNaN(day)) {
        date.setMonth(monthIndex);
        date.setDate(day);
        
        // Check if the date is in the future (next year), and adjust to previous year if needed
        if (date > new Date()) {
          date.setFullYear(date.getFullYear() - 1);
        }
      }
    }
    
    return date;
  };

  const handleSave = () => {
    let finalTime: Date;
    let finalDuration: number;
    
    // Calculate final time based on selection method
    if (!customTime || selectedTimeAgo !== -1) {
      // User selected a preset time ago option
      finalTime = new Date();
      finalTime.setMinutes(finalTime.getMinutes() - selectedTimeAgo);
    } else {
      // User selected custom time
      // First get the base date from selected day
      finalTime = getDateFromSelectedDay(selectedDay);
      
      // Then set the time components
      const hour = parseInt(selectedHour, 10);
      const minute = parseInt(selectedMinute, 10);
      
      // Convert 12hr to 24hr format
      const hour24 = selectedAmPm === 'PM' ? 
        (hour === 12 ? 12 : hour + 12) : 
        (hour === 12 ? 0 : hour);
      
      finalTime.setHours(hour24);
      finalTime.setMinutes(minute);
      finalTime.setSeconds(0);
      finalTime.setMilliseconds(0);
    }
    
    // Calculate final duration
    if (selectedDuration !== -1) {
      // User selected a preset duration
      finalDuration = selectedDuration;
    } else {
      // User selected custom duration
      finalDuration = (parseInt(durationHours, 10) * 60) + parseInt(durationMinutes, 10);
    }
    
    // Save the data
    console.log('Saving time data:', { 
      time: finalTime,
      timeISOString: finalTime.toISOString(),
      timeFormatted: finalTime.toLocaleString(),
      duration: finalDuration,
    });
    
    // Here you would typically pass this data back to the parent component
    // or store it in global state or local database
    
    // Navigate to detail screen instead of trigger screen
    router.push('/detail-screen');
  };

  const handleCustomTimeSelection = () => {
    setSelectedTimeAgo(-1);
    setShowTimePicker(true);
  };

  const handleCustomDurationSelection = () => {
    setSelectedDuration(-1);
    setShowDurationPicker(true);
  };

  const formatTime = () => {
    const hour = parseInt(selectedHour, 10);
    const minute = parseInt(selectedMinute, 10);
    const minuteStr = minute < 10 ? `0${minute}` : minute;
    return `${selectedDay} ${hour}:${minuteStr} ${selectedAmPm}`;
  };

  const formatCustomDuration = () => {
    const hours = parseInt(durationHours, 10);
    const minutes = parseInt(durationMinutes, 10);
    
    if (hours === 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    } else if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Helper function to render time option buttons
  const renderTimeOption = (option) => (
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
        {option.value === -1 && selectedTimeAgo === -1 
          ? formatTime() 
          : option.label}
      </Text>
    </TouchableOpacity>
  );

  // Helper function to render duration option buttons
  const renderDurationOption = (duration) => (
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
  );

  const previousDays = getPreviousDays();

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
            thumbColor="#fff"
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
            <View style={styles.optionsGrid}>
              {/* First row: Just happened, 15 minutes */}
              <View style={styles.optionsRow}>
                {renderTimeOption(timeAgoOptions[0])}
                {renderTimeOption(timeAgoOptions[1])}
              </View>
              
              {/* Second row: 30 minutes, 45 minutes */}
              <View style={styles.optionsRow}>
                {renderTimeOption(timeAgoOptions[2])}
                {renderTimeOption(timeAgoOptions[3])}
              </View>
              
              {/* Third row: 1 hour, 1.5 hours */}
              <View style={styles.optionsRow}>
                {renderTimeOption(timeAgoOptions[4])}
                {renderTimeOption(timeAgoOptions[5])}
              </View>
              
              {/* Fourth row: 2 hours, Custom time */}
              <View style={styles.optionsRow}>
                {renderTimeOption(timeAgoOptions[6])}
                {selectedTimeAgo === -1 ? (
                  <TouchableOpacity
                    style={[styles.timeOption, styles.selectedOption]}
                    onPress={handleCustomTimeSelection}
                  >
                    <Text style={[styles.timeOptionText, styles.selectedOptionText]}>
                      {formatTime()}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.timeOption}
                    onPress={handleCustomTimeSelection}
                  >
                    <Text style={styles.timeOptionText}>Custom time</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>How long did it last?</Text>
            <View style={styles.optionsGrid}>
              {/* First row of duration options: 1 minute, 2 minutes */}
              <View style={styles.optionsRow}>
                {renderDurationOption(durationOptions[0])}
                {renderDurationOption(durationOptions[1])}
              </View>
              
              {/* Second row of duration options: 3 minutes, 5 minutes */}
              <View style={styles.optionsRow}>
                {renderDurationOption(durationOptions[2])}
                {renderDurationOption(durationOptions[3])}
              </View>
              
              {/* Third row of duration options: 10 minutes, 15 minutes */}
              <View style={styles.optionsRow}>
                {renderDurationOption(durationOptions[4])}
                {renderDurationOption(durationOptions[5])}
              </View>
              
              {/* Fourth row: 20 minutes, Custom duration */}
              <View style={styles.optionsRow}>
                {renderDurationOption(durationOptions[6])}
                {selectedDuration === -1 ? (
                  <TouchableOpacity
                    style={[styles.timeOption, styles.selectedOption]}
                    onPress={handleCustomDurationSelection}
                  >
                    <Text style={[styles.timeOptionText, styles.selectedOptionText]}>
                      {formatCustomDuration()}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.timeOption}
                    onPress={handleCustomDurationSelection}
                  >
                    <Text style={styles.timeOptionText}>Custom duration</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
      
      {/* Custom Time Picker */}
      {showTimePicker && Platform.OS === 'ios' && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pickerBody}>
            {/* Day Picker - First Row */}
            <View style={styles.dayPickerContainer}>
              <Picker
                selectedValue={selectedDay}
                style={styles.dayPickerItem}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setSelectedDay(itemValue)}
              >
                {previousDays.map((day, index) => (
                  <Picker.Item key={`day-${index}`} label={day.label} value={day.value} />
                ))}
              </Picker>
            </View>
            
            {/* Time Picker - Second Row */}
            <View style={styles.timePickerRow}>
              {/* Hour Picker */}
              <Picker
                selectedValue={selectedHour}
                style={styles.timePickerItem}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setSelectedHour(itemValue)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                  <Picker.Item key={`hour-${hour}`} label={String(hour)} value={String(hour)} />
                ))}
              </Picker>
              
              {/* Minute Picker */}
              <Picker
                selectedValue={selectedMinute}
                style={styles.timePickerItem}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setSelectedMinute(itemValue)}
              >
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                  <Picker.Item 
                    key={`minute-${minute}`} 
                    label={minute < 10 ? `0${minute}` : String(minute)} 
                    value={String(minute)} 
                  />
                ))}
              </Picker>
              
              {/* AM/PM Picker */}
              <Picker
                selectedValue={selectedAmPm}
                style={styles.amPmPickerItem}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setSelectedAmPm(itemValue)}
              >
                <Picker.Item label="AM" value="AM" />
                <Picker.Item label="PM" value="PM" />
              </Picker>
            </View>
          </View>
        </View>
      )}
      
      {/* Duration Picker */}
      {showDurationPicker && Platform.OS === 'ios' && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pickerContent}>
            <View style={styles.pickerLabelContainer}>
              <Text style={styles.pickerColumnLabel}>hours</Text>
              <Text style={styles.pickerColumnLabel}>min</Text>
            </View>
            
            <View style={styles.pickerRowContent}>
              {/* Hours Picker */}
              <Picker
                selectedValue={durationHours}
                style={styles.durationPickerItem}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setDurationHours(itemValue)}
              >
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <Picker.Item key={`duration-hour-${hour}`} label={String(hour)} value={String(hour)} />
                ))}
              </Picker>
              
              {/* Minutes Picker */}
              <Picker
                selectedValue={durationMinutes}
                style={styles.durationPickerItem}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setDurationMinutes(itemValue)}
              >
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                  <Picker.Item 
                    key={`duration-minute-${minute}`} 
                    label={minute < 10 ? `0${minute}` : String(minute)} 
                    value={String(minute)} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      )}
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderRadius: 12,
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
    borderRadius: 12,
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
  optionsGrid: {
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeOption: {
    flex: 1,
    marginHorizontal: 5,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
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
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pickerBody: {
    backgroundColor: '#333',
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
  dayPickerContainer: {
    padding: 10,
    backgroundColor: '#333',
    alignItems: 'center',
    paddingBottom: 20
  },
  timePickerRow: {
    flexDirection: 'row',
    backgroundColor: '#333',
    justifyContent: 'center',
    paddingBottom: 20,
    paddingTop: 10,
  },
  pickerContent: {
    backgroundColor: '#333',
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#333',
    paddingTop: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  pickerColumnLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    width: 120,
    textAlign: 'center',
  },
  pickerRowContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    marginTop: 30,
  },
  dayPickerItem: {
    width: 240,
    height: 100,
    backgroundColor: '#333',
    color: '#fff',
  },
  timePickerItem: {
    width: 100,
    height: 180,
    backgroundColor: '#333',
    color: '#fff',
  },
  durationPickerItem: {
    width: 120,
    height: 180,
    backgroundColor: '#333',
    color: '#fff',
  },
  amPmPickerItem: {
    width: 100,
    height: 180,
    backgroundColor: '#333',
    color: '#fff',
  },
  pickerItem: {
    color: '#fff',
    fontSize: 22,
    height: 120,
  },
});
