import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity 
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
            {/* Hours Picker */}
            <Picker
              style={styles.picker}
              selectedValue={selectedHours}
              onValueChange={setSelectedHours}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <Picker.Item 
                  key={`hour-${i}`} 
                  label={i.toString().padStart(2, '0')} 
                  value={i} 
                />
              ))}
            </Picker>
            
            <Text style={styles.pickerSeparator}>:</Text>
            
            {/* Minutes Picker */}
            <Picker
              style={styles.picker}
              selectedValue={selectedMinutes}
              onValueChange={setSelectedMinutes}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <Picker.Item 
                  key={`minute-${i}`} 
                  label={i.toString().padStart(2, '0')} 
                  value={i} 
                />
              ))}
            </Picker>
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