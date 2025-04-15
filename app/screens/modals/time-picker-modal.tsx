import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '@/app/constants/theme';
import ModalComponent from './modal';
import { Button } from '@/app/components';

interface TimePickerModalProps {
  visible: boolean;
  onCancel: () => void;
  onDone: () => void;
  selectedHours: number;
  selectedMinutes: number;
  setSelectedHours: (hours: number) => void;
  setSelectedMinutes: (minutes: number) => void;
}

export default function TimePickerModal({
  visible,
  onCancel,
  onDone,
  selectedHours,
  selectedMinutes,
  setSelectedHours,
  setSelectedMinutes
}: TimePickerModalProps) {
  // Create date object from hours and minutes
  const [date, setDate] = useState(() => {
    const newDate = new Date();
    newDate.setHours(selectedHours);
    newDate.setMinutes(selectedMinutes);
    newDate.setSeconds(0);
    return newDate;
  });

  // Update selected time whenever date changes
  useEffect(() => {
    if (date) {
      setSelectedHours(date.getHours());
      setSelectedMinutes(date.getMinutes());
    }
  }, [date, setSelectedHours, setSelectedMinutes]);

  // Handle time changes
  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Modal footer with action buttons
  const modalFooter = (
    <View style={styles.footerContainer}>
      <Button
        title="Cancel"
        variant="secondary"
        onPress={onCancel}
        style={styles.footerButton}
      />
      <Button
        title="Done"
        variant="primary"
        onPress={onDone}
        style={styles.footerButton}
      />
    </View>
  );

  if (!visible) return null;

  return (
    <ModalComponent
      visible={visible}
      title="Select Time"
      onClose={onCancel}
      footer={modalFooter}
      contentStyle={styles.modalContent}
    >
      <View style={styles.contentContainer}>
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
          style={styles.picker}
        />
      </View>
    </ModalComponent>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: 0,
  } as ViewStyle,
  
  contentContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  picker: {
    height: 200,
    ...(Platform.OS === 'ios' ? { width: 300 } : {}),
  } as ViewStyle,
  
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  } as ViewStyle,
  
  footerButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  } as ViewStyle,
});