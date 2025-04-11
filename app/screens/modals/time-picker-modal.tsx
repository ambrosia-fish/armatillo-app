import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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

/**
 * Cross-platform time picker modal with consistent styling
 */
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
      aria-label="Hours"
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
      aria-label="Minutes"
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
      accessibilityLabel="Hours"
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
      accessibilityLabel="Minutes"
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

  return (
    <ModalComponent
      visible={visible}
      title="Select Time"
      onClose={onCancel}
      footer={modalFooter}
      contentStyle={styles.modalContent}
    >
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
      
      <View style={styles.labelContainer}>
        <Text style={styles.pickerLabel}>Hours</Text>
        <View style={styles.labelSpacer} />
        <Text style={styles.pickerLabel}>Minutes</Text>
      </View>
    </ModalComponent>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  } as ViewStyle,
  
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  } as ViewStyle,
  
  picker: {
    flex: 1,
    height: 200,
  } as ViewStyle,
  
  pickerSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: theme.spacing.sm,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  
  pickerLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    width: 80,
    textAlign: 'center',
  } as TextStyle,
  
  labelSpacer: {
    width: 20,
  } as ViewStyle,
  
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  } as ViewStyle,
  
  footerButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  } as ViewStyle,
});