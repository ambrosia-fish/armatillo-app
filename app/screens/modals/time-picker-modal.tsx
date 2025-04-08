import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import theme from '@/app/constants/theme';

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
  // Generate hours options for both web and native
  const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
    label: i.toString().padStart(2, '0'),
    value: i
  }));

  // Generate minutes options for both web and native
  const minutesOptions = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, '0'),
    value: i
  }));

  // Render web hours picker
  const renderWebHoursPicker = () => (
    <select
      value={selectedHours}
      onChange={(e) => setSelectedHours(Number(e.target.value))}
      style={{
        height: 200,
        width: '100%',
        fontSize: 16,
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
        border: 'none',
        flex: 1,
        textAlign: 'center',
      }}
    >
      {hoursOptions.map((option) => (
        <option key={`hour-${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  // Render web minutes picker
  const renderWebMinutesPicker = () => (
    <select
      value={selectedMinutes}
      onChange={(e) => setSelectedMinutes(Number(e.target.value))}
      style={{
        height: 200,
        width: '100%',
        fontSize: 16,
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
        border: 'none',
        flex: 1,
        textAlign: 'center',
      }}
    >
      {minutesOptions.map((option) => (
        <option key={`minute-${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  // Render native hours picker
  const renderNativeHoursPicker = () => (
    <Picker
      style={styles.picker}
      selectedValue={selectedHours}
      onValueChange={setSelectedHours}
    >
      {hoursOptions.map((option) => (
        <Picker.Item
          key={`hour-${option.value}`}
          label={option.label}
          value={option.value}
        />
      ))}
    </Picker>
  );

  // Render native minutes picker
  const renderNativeMinutesPicker = () => (
    <Picker
      style={styles.picker}
      selectedValue={selectedMinutes}
      onValueChange={setSelectedMinutes}
    >
      {minutesOptions.map((option) => (
        <Picker.Item
          key={`minute-${option.value}`}
          label={option.label}
          value={option.value}
        />
      ))}
    </Picker>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.pickerModalContainer}>
        <View style={styles.pickerModalContent}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.pickerCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDone}>
              <Text style={styles.pickerDoneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pickerContainer}>
            {/* Hours Picker - conditionally render based on platform */}
            {Platform.OS === 'web' 
              ? renderWebHoursPicker() 
              : renderNativeHoursPicker()
            }
            
            <Text style={styles.pickerSeparator}>:</Text>
            
            {/* Minutes Picker - conditionally render based on platform */}
            {Platform.OS === 'web' 
              ? renderWebMinutesPicker() 
              : renderNativeMinutesPicker()
            }
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerModalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.md,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  pickerCancelButton: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  pickerDoneButton: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  picker: {
    flex: 1,
    height: 200,
  },
  pickerSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: theme.spacing.sm,
  },
});