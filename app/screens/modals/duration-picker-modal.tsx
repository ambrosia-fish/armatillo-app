import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import theme from '@/app/constants/theme';
import ModalComponent from './modal';
import { Button } from '@/app/components';

interface DurationPickerModalProps {
  visible: boolean;
  onCancel: () => void;
  onDone: () => void;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
}

/**
 * Cross-platform duration picker modal with consistent styling
 */
export default function DurationPickerModal({
  visible,
  onCancel,
  onDone,
  selectedDuration,
  setSelectedDuration
}: DurationPickerModalProps) {
  // Generate picker options for both web and native
  const pickerOptions = [
    { label: "Did Not Engage", value: 0 },
    ...Array.from({ length: 120 }, (_, i) => ({ 
      label: `${i + 1} min`, 
      value: i + 1 
    }))
  ];

  // Render web picker (select element)
  const renderWebPicker = () => (
    <select
      value={selectedDuration}
      onChange={(e) => setSelectedDuration(Number(e.target.value))}
      style={{
        height: 200,
        width: '100%',
        fontSize: 16,
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
        border: 'none',
      }}
      aria-label="Duration in minutes"
    >
      {pickerOptions.map((option) => (
        <option key={`duration-${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  // Render native picker
  const renderNativePicker = () => (
    <Picker
      style={styles.picker}
      selectedValue={selectedDuration}
      onValueChange={setSelectedDuration}
      accessibilityLabel="Duration in minutes"
    >
      {pickerOptions.map((option) => (
        <Picker.Item
          key={`duration-${option.value}`}
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
      title="Select Duration"
      onClose={onCancel}
      footer={modalFooter}
      contentStyle={styles.modalContent}
    >
      <View style={styles.pickerContainer}>
        {/* Conditionally render web or native picker based on platform */}
        {Platform.OS === 'web' 
          ? renderWebPicker() 
          : renderNativePicker()
        }
      </View>
      
      <View style={styles.labelContainer}>
        <Text style={styles.pickerLabel}>Duration (minutes)</Text>
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
  
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  
  pickerLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  
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