import React, { useState } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Platform,
  Switch,
  DateTimePickerAndroid
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import theme from '@/app/constants/theme';
import { 
  Header, 
  Button, 
  EmojiPill, 
  EmojiPillRow, 
  AnswerSelectorModal 
} from '@/app/components';
import { useFormContext } from '@/app/context/FormContext';
import { errorService } from '@/app/services/ErrorService';
import OptionDictionaries, { OptionItem } from '@/app/constants/optionDictionaries';

/**
 * All-in-one screen for tracking BFRB instances
 */
export default function NewEntryScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Time state
  const [date, setDate] = useState(formData.time || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState<string>(
    formData.duration?.toString() || '5'
  );

  // Selected category data
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    formData.selectedLocations || []
  );
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    formData.selectedActivities || []
  );
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    formData.selectedEmotions || []
  );
  const [selectedThoughts, setSelectedThoughts] = useState<string[]>(
    formData.selectedThoughts || []
  );
  const [selectedSensations, setSelectedSensations] = useState<string[]>(
    formData.selectedSensations || []
  );
  const [awarenessType, setAwarenessType] = useState<string>(
    formData.awarenessType || 'automatic'
  );
  const [urgeStrength, setUrgeStrength] = useState<string>(
    formData.urgeStrength?.toString() || '3'
  );
  
  // Notes
  const [notes, setNotes] = useState<string>(formData.notes || '');
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOptions, setModalOptions] = useState<OptionItem[]>([]);
  const [modalSelected, setModalSelected] = useState<string[]>([]);
  const [currentModalType, setCurrentModalType] = useState<
    'location' | 'activity' | 'emotion' | 'thought' | 'sensation' | 'awareness' | 'urge'
  >('location');
  
  /**
   * Open a specific category's selection modal
   */
  const openModal = (
    type: 'location' | 'activity' | 'emotion' | 'thought' | 'sensation' | 'awareness' | 'urge',
    title: string,
    options: OptionItem[],
    selectedIds: string[]
  ) => {
    try {
      setModalTitle(title);
      setModalOptions(options);
      setModalSelected(selectedIds);
      setCurrentModalType(type);
      setModalVisible(true);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'open_selection_modal' }
      });
    }
  };

  /**
   * Handle selection from the modal
   */
  const handleModalSelect = (selectedIds: string[]) => {
    try {
      switch (currentModalType) {
        case 'location':
          setSelectedLocations(selectedIds);
          break;
        case 'activity':
          setSelectedActivities(selectedIds);
          break;
        case 'emotion':
          setSelectedEmotions(selectedIds);
          break;
        case 'thought':
          setSelectedThoughts(selectedIds);
          break;
        case 'sensation':
          setSelectedSensations(selectedIds);
          break;
        case 'awareness':
          if (selectedIds.length > 0) {
            setAwarenessType(selectedIds[0]);
          }
          break;
        case 'urge':
          if (selectedIds.length > 0) {
            setUrgeStrength(selectedIds[0]);
          }
          break;
      }
      setModalVisible(false);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'handle_modal_selection' }
      });
    }
  };

  /**
   * Handle date change from the date picker
   */
  const onDateChange = (event: any, selectedDate?: Date) => {
    try {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }

      if (selectedDate) {
        setDate(selectedDate);
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'change_date' }
      });
    }
  };

  /**
   * Show the date picker (platform-specific)
   */
  const showDatePickerModal = () => {
    try {
      if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
          value: date,
          mode: 'datetime',
          is24Hour: false,
          onChange: onDateChange,
        });
      } else {
        setShowDatePicker(true);
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'show_date_picker' }
      });
    }
  };

  /**
   * Handle duration change
   */
  const handleDurationChange = (value: string) => {
    try {
      // Only allow numbers
      const numericValue = value.replace(/[^0-9]/g, '');
      setDuration(numericValue);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'change_duration' }
      });
    }
  };

  /**
   * Toggle awareness type
   */
  const toggleAwarenessType = () => {
    try {
      setAwarenessType(prev => prev === 'intentional' ? 'automatic' : 'intentional');
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'toggle_awareness_type' }
      });
    }
  };

  /**
   * Toggle selection of an item in a category
   */
  const toggleCategoryItem = (
    category: 'location' | 'activity' | 'emotion' | 'thought' | 'sensation',
    id: string
  ) => {
    try {
      switch (category) {
        case 'location':
          setSelectedLocations(prev => 
            prev.includes(id) 
              ? prev.filter(item => item !== id) 
              : [...prev, id]
          );
          break;
        case 'activity':
          setSelectedActivities(prev => 
            prev.includes(id) 
              ? prev.filter(item => item !== id) 
              : [...prev, id]
          );
          break;
        case 'emotion':
          setSelectedEmotions(prev => 
            prev.includes(id) 
              ? prev.filter(item => item !== id) 
              : [...prev, id]
          );
          break;
        case 'thought':
          setSelectedThoughts(prev => 
            prev.includes(id) 
              ? prev.filter(item => item !== id) 
              : [...prev, id]
          );
          break;
        case 'sensation':
          setSelectedSensations(prev => 
            prev.includes(id) 
              ? prev.filter(item => item !== id) 
              : [...prev, id]
          );
          break;
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'toggle_category_item' }
      });
    }
  };

  /**
   * Handle saving the form and navigating home
   */
  const handleSubmit = () => {
    try {
      // Update form data with all values
      updateFormData({
        // Time data
        time: date,
        duration: Number(duration) || 5,
        
        // Awareness and urge data
        awarenessType,
        urgeStrength,
        
        // Category data
        selectedLocations,
        selectedActivities,
        selectedEmotions,
        selectedThoughts,
        selectedSensations,
        
        // Notes
        notes,
      });
      
      // Navigate to home screen after submitting
      router.replace('/');
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'submit_form' }
      });
    }
  };

  /**
   * Handle cancellation and return to previous screen
   */
  const handleCancel = () => {
    try {
      router.back();
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'cancel_entry' }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Header 
        title="New Instance" 
        showBackButton 
        onLeftPress={handleCancel}
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Awareness Type (Intentional/Automatic) */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Awareness Type</Text>
          <View style={styles.awarenessContainer}>
            <View style={styles.toggleLabelContainer}>
              <Text 
                style={[
                  styles.toggleLabel, 
                  awarenessType === 'automatic' && styles.toggleLabelActive
                ]}
              >
                Automatic
              </Text>
              <Switch
                trackColor={{ 
                  false: theme.colors.neutral.medium, 
                  true: theme.colors.primary.light 
                }}
                thumbColor={
                  awarenessType === 'intentional' 
                    ? theme.colors.primary.main 
                    : theme.colors.neutral.white
                }
                ios_backgroundColor={theme.colors.neutral.medium}
                onValueChange={toggleAwarenessType}
                value={awarenessType === 'intentional'}
                accessible={true}
                accessibilityLabel="Toggle between automatic and intentional awareness"
                accessibilityHint="Switches between automatic and intentional awareness types"
                accessibilityRole="switch"
              />
              <Text 
                style={[
                  styles.toggleLabel, 
                  awarenessType === 'intentional' && styles.toggleLabelActive
                ]}
              >
                Intentional
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => openModal(
                'awareness',
                'Select Awareness Type',
                OptionDictionaries.awarenessOptions,
                [awarenessType]
              )}
              style={styles.moreOptionsButton}
              accessibilityLabel="More awareness type options"
              accessibilityHint="Opens modal with more awareness type options"
              accessibilityRole="button"
            >
              <Ionicons 
                name="options-outline" 
                size={20} 
                color={theme.colors.primary.main} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Urge Strength */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Urge Strength</Text>
            <TouchableOpacity
              onPress={() => openModal(
                'urge',
                'Select Urge Strength',
                OptionDictionaries.urgeStrengthOptions,
                [urgeStrength]
              )}
              style={styles.moreOptionsButton}
              accessibilityLabel="Select urge strength"
              accessibilityHint="Opens modal to select urge strength"
              accessibilityRole="button"
            >
              <Ionicons 
                name="options-outline" 
                size={20} 
                color={theme.colors.primary.main} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.urgeStrengthContainer}>
            {OptionDictionaries.urgeStrengthOptions.map((option) => (
              <TouchableOpacity 
                key={option.id}
                style={[
                  styles.urgeStrengthOption,
                  urgeStrength === option.id && styles.urgeStrengthSelected,
                  { opacity: parseInt(option.id) / 5 + 0.2 }
                ]}
                onPress={() => setUrgeStrength(option.id)}
                accessibilityLabel={option.label}
                accessibilityRole="radio"
                accessibilityState={{ checked: urgeStrength === option.id }}
              >
                <Text style={styles.urgeStrengthEmoji}>{option.emoji}</Text>
                <Text 
                  style={[
                    styles.urgeStrengthText,
                    urgeStrength === option.id && styles.urgeStrengthTextSelected
                  ]}
                >
                  {option.id}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time and Duration */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Time & Duration</Text>
          
          {/* Date/Time Picker */}
          <View style={styles.timeContainer}>
            <Text style={styles.inputLabel}>When did this happen?</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={showDatePickerModal}
              accessibilityLabel="Select date and time"
              accessibilityHint="Opens date and time picker"
              accessibilityRole="button"
            >
              <Text style={styles.dateText}>
                {date.toLocaleString()}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.colors.primary.main}
              />
            </TouchableOpacity>
            
            {Platform.OS === 'ios' && showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="spinner"
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Duration Input */}
          <View style={styles.durationContainer}>
            <Text style={styles.inputLabel}>How long did it last? (minutes)</Text>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                value={duration}
                onChangeText={handleDurationChange}
                keyboardType="number-pad"
                placeholder="5"
                placeholderTextColor={theme.colors.text.tertiary}
                returnKeyType="done"
                accessibilityLabel="Duration in minutes"
                accessibilityHint="Enter the duration in minutes"
              />
              <Text style={styles.durationUnit}>minutes</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity
              onPress={() => openModal(
                'location',
                'Select Locations',
                OptionDictionaries.locationOptions,
                selectedLocations
              )}
              style={styles.addButton}
              accessibilityLabel="Add locations"
              accessibilityHint="Opens modal to select locations"
              accessibilityRole="button"
            >
              <Ionicons 
                name="add-circle" 
                size={24} 
                color={theme.colors.primary.main} 
              />
            </TouchableOpacity>
          </View>
          
          <EmojiPillRow
            items={OptionDictionaries.locationOptions.filter(
              item => selectedLocations.includes(item.id)
            )}
            selectedIds={selectedLocations}
            onToggleItem={(id) => toggleCategoryItem('location', id)}
            onPressAdd={() => openModal(
              'location',
              'Select Locations',
              OptionDictionaries.locationOptions,
              selectedLocations
            )}
          />
        </View>

        {/* Activity */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <TouchableOpacity
              onPress={() => openModal(
                'activity',
                'Select Activities',
                OptionDictionaries.activityOptions,
                selectedActivities
              )}
              style={styles.addButton}
              accessibilityLabel="Add activities"
              accessibilityHint="Opens modal to select activities"
              accessibilityRole="button"
            >
              <Ionicons 
                name="add-circle" 
                size={24} 
                color={theme.colors.primary.main} 
              />
            </TouchableOpacity>
          </View>
          
          <EmojiPillRow
            items={OptionDictionaries.activityOptions.filter(
              item => selectedActivities.includes(item.id)
            )}
            selectedIds={selectedActivities}
            onToggleItem={(id) => toggleCategoryItem('activity', id)}
            onPressAdd={() => openModal(
              'activity',
              'Select Activities',
              OptionDictionaries.activityOptions,
              selectedActivities
            )}
          />
        </View>

        {/* Emotions */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Emotions</Text>
            <TouchableOpacity
              onPress={() => openModal(
                'emotion',
                'Select Emotions',
                OptionDictionaries.emotionOptions,
                selectedEmotions
              )}
              style={styles.addButton}
              accessibilityLabel="Add emotions"
              accessibilityHint="Opens modal to select emotions"
              accessibilityRole="button"
            >
              <Ionicons 
                name="add-circle" 
                size={24} 
                color={theme.colors.primary.main} 
              />
            </TouchableOpacity>
          </View>
          
          <EmojiPillRow
            items={OptionDictionaries.emotionOptions.filter(
              item => selectedEmotions.includes(item.id)
            )}
            selectedIds={selectedEmotions}
            onToggleItem={(id) => toggleCategoryItem('emotion', id)}
            onPressAdd={() => openModal(
              'emotion',
              'Select Emotions',
              OptionDictionaries.emotionOptions,
              selectedEmotions
            )}
          />
        </View>

        {/* Thought Patterns */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Thought Patterns</Text>
            <TouchableOpacity
              onPress={() => openModal(
                'thought',
                'Select Thought Patterns',
                OptionDictionaries.thoughtOptions,
                selectedThoughts
              )}
              style={styles.addButton}
              accessibilityLabel="Add thought patterns"
              accessibilityHint="Opens modal to select thought patterns"
              accessibilityRole="button"
            >
              <Ionicons 
                name="add-circle" 
                size={24} 
                color={theme.colors.primary.main} 
              />
            </TouchableOpacity>
          </View>
          
          <EmojiPillRow
            items={OptionDictionaries.thoughtOptions.filter(
              item => selectedThoughts.includes(item.id)
            )}
            selectedIds={selectedThoughts}
            onToggleItem={(id) => toggleCategoryItem('thought', id)}
            onPressAdd={() => openModal(
              'thought',
              'Select Thought Patterns',
              OptionDictionaries.thoughtOptions,
              selectedThoughts
            )}
          />
        </View>

        {/* Physical Sensations */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Physical Sensations</Text>
            <TouchableOpacity
              onPress={() => openModal(
                'sensation',
                'Select Physical Sensations',
                OptionDictionaries.sensationOptions,
                selectedSensations
              )}
              style={styles.addButton}
              accessibilityLabel="Add physical sensations"
              accessibilityHint="Opens modal to select physical sensations"
              accessibilityRole="button"
            >
              <Ionicons 
                name="add-circle" 
                size={24} 
                color={theme.colors.primary.main} 
              />
            </TouchableOpacity>
          </View>
          
          <EmojiPillRow
            items={OptionDictionaries.sensationOptions.filter(
              item => selectedSensations.includes(item.id)
            )}
            selectedIds={selectedSensations}
            onToggleItem={(id) => toggleCategoryItem('sensation', id)}
            onPressAdd={() => openModal(
              'sensation',
              'Select Physical Sensations',
              OptionDictionaries.sensationOptions,
              selectedSensations
            )}
          />
        </View>

        {/* Notes */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.sectionDescription}>
            Add any additional details you want to record.
          </Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes about this instance..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Notes field"
            accessibilityHint="Add any additional notes about this instance"
          />
        </View>
      </ScrollView>

      {/* Answer Selector Modal */}
      <AnswerSelectorModal
        visible={modalVisible}
        title={modalTitle}
        options={modalOptions}
        selectedIds={modalSelected}
        onSelect={handleModalSelect}
        onClose={() => setModalVisible(false)}
        allowMultiple={currentModalType !== 'awareness' && currentModalType !== 'urge'}
        allowCustom={currentModalType !== 'awareness' && currentModalType !== 'urge'}
      />
      
      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          title="Submit"
          variant="primary"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
        
        <Button
          title="Cancel"
          variant="text"
          onPress={handleCancel}
          style={styles.cancelButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.huge,
  },
  formSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  // Awareness Type Styles
  awarenessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing.md,
  },
  toggleLabelActive: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.bold,
  },
  moreOptionsButton: {
    padding: theme.spacing.sm,
  },
  // Urge Strength Styles
  urgeStrengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  urgeStrengthOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.primary.light + '20',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  urgeStrengthSelected: {
    backgroundColor: theme.colors.primary.light + '40',
    borderColor: theme.colors.primary.main,
  },
  urgeStrengthEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  urgeStrengthText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
  },
  urgeStrengthTextSelected: {
    color: theme.colors.primary.main,
  },
  // Time and Duration Styles
  timeContainer: {
    marginBottom: theme.spacing.lg,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    padding: theme.spacing.md,
  },
  dateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  durationContainer: {
    marginTop: theme.spacing.md,
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationInput: {
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    width: 100,
    marginRight: theme.spacing.md,
  },
  durationUnit: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  // Common input styles
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  notesInput: {
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // Button styles
  addButton: {
    padding: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  submitButton: {
    marginBottom: theme.spacing.md,
  },
  cancelButton: {},
});
