import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';

import { Text, Button, Card, Header, CancelFooter } from '../../components';
import { useFormContext } from '../../context/FormContext';
import theme from '../../constants/theme';

// Duration options in minutes
const durationOptions = [1, 2, 3, 5, 10, 15, 30, 60];

export default function TimeScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Default to current time if not set
  const [selectedDate, setSelectedDate] = useState<Date>(
    formData.time || new Date()
  );
  
  // Duration in minutes, default to 5 minutes if not set
  const [duration, setDuration] = useState<number>(
    formData.duration as number || 5
  );
  
  // Show date picker - used for Android which doesn't show the picker by default
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');
  
  // For Android, we need to show the picker when the user taps the button
  const showPicker = (type: 'date' | 'time') => {
    if (type === 'date') {
      setShowDatePicker(true);
    } else {
      setShowTimePicker(true);
    }
  };
  
  // Handle date/time changes
  const onChange = (event: any, selectedValue?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        // User cancelled the picker
        setShowDatePicker(false);
        setShowTimePicker(false);
        return;
      }
    }
    
    const currentDate = selectedValue || selectedDate;
    setSelectedDate(currentDate);
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Handle continue button
  const handleContinue = () => {
    // Update form data with time and duration
    updateFormData({
      time: selectedDate,
      duration: duration
    });
    
    // Navigate to next screen
    router.push('/strength-screen');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      
      <Header 
        title="Time & Duration" 
        leftIcon="close"
        onLeftPress={() => router.back()}
      />
      
      <View style={styles.content}>
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>When did it happen?</Text>
          <Text style={styles.cardDescription}>
            Please select the approximate date and time when the BFRB instance occurred.
          </Text>
          
          {Platform.OS === 'android' && (
            <View style={styles.androidButtonContainer}>
              <Button 
                title={`Date: ${formatDate(selectedDate)}`}
                onPress={() => showPicker('date')}
                variant="secondary"
                style={styles.dateTimeButton}
              />
              
              <Button 
                title={`Time: ${formatTime(selectedDate)}`}
                onPress={() => showPicker('time')}
                variant="secondary"
                style={styles.dateTimeButton}
              />
            </View>
          )}
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onChange}
              maximumDate={new Date()}
              style={styles.dateTimePicker}
            />
          )}
          
          {showTimePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChange}
              style={styles.dateTimePicker}
            />
          )}
        </Card>
        
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>How long did it last?</Text>
          <Text style={styles.cardDescription}>
            Please select the approximate duration of the BFRB instance.
          </Text>
          
          <View style={styles.pickerContainer}>
            {Platform.OS === 'ios' ? (
              <Picker
                selectedValue={duration}
                onValueChange={(itemValue) => setDuration(Number(itemValue))}
                itemStyle={styles.pickerItem}
              >
                {durationOptions.map((option) => (
                  <Picker.Item 
                    key={option} 
                    label={`${option} ${option === 1 ? 'minute' : 'minutes'}`} 
                    value={option} 
                  />
                ))}
              </Picker>
            ) : (
              <Button
                title={`Duration: ${duration} ${duration === 1 ? 'minute' : 'minutes'}`}
                onPress={() => {
                  // For Android, we'd typically show a modal with options
                  // This is simplified for the example
                  const nextIndex = (durationOptions.indexOf(duration) + 1) % durationOptions.length;
                  setDuration(durationOptions[nextIndex]);
                }}
                variant="secondary"
                style={styles.dateTimeButton}
              />
            )}
          </View>
        </Card>
      </View>
      
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
  dateTimePicker: {
    marginTop: theme.spacing.md,
    marginBottom: Platform.OS === 'ios' ? theme.spacing.xl : 0,
  } as ViewStyle,
  androidButtonContainer: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  dateTimeButton: {
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    overflow: 'hidden',
  } as ViewStyle,
  pickerItem: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
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