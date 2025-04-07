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
  DateTimePickerAndroid,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '@/app/services/api';

import theme from '@/app/constants/theme';
import { 
  Header, 
  Button, 
  AnswerSelectorModal,
  CategoryPills
} from '@/app/components';
import {
  TimePickerModal,
  DurationPickerModal
} from '@/app/screens/modals';
import { useFormContext } from '@/app/context/FormContext';
import { errorService } from '@/app/services/ErrorService';
import OptionDictionaries, { OptionItem } from '@/app/constants/optionDictionaries';

export default function NewEntryScreen() {
  const router = useRouter();
  const { formData, updateFormData } = useFormContext();
  
  // Time state
  const [date, setDate] = useState(formData.time || new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHours, setSelectedHours] = useState(
    formData.time ? formData.time.getHours() : new Date().getHours()
  );
  const [selectedMinutes, setSelectedMinutes] = useState(
    formData.time ? formData.time.getMinutes() : new Date().getMinutes()
  );
  
  // Duration state
  const [duration, setDuration] = useState(
    formData.duration?.toString() || 'Did not engage'
  );
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(
    parseInt(formData.duration || 5, 10)
  );

  // Selected category data
  const [selectedLocations, setSelectedLocations] = useState(
    formData.selectedLocations || []
  );
  const [selectedActivities, setSelectedActivities] = useState(
    formData.selectedActivities || []
  );
  const [selectedEmotions, setSelectedEmotions] = useState(
    formData.selectedEmotions || []
  );
  const [selectedThoughts, setSelectedThoughts] = useState(
    formData.selectedThoughts || []
  );
  const [selectedSensations, setSelectedSensations] = useState(
    formData.selectedSensations || []
  );
  const [awarenessType, setAwarenessType] = useState(
    formData.awarenessType || 'automatic'
  );
  const [urgeStrength, setUrgeStrength] = useState(
    formData.urgeStrength?.toString() || '3'
  );
  
  // Notes
  const [notes, setNotes] = useState(formData.notes || '');
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOptions, setModalOptions] = useState([]);
  const [modalSelected, setModalSelected] = useState([]);
  const [currentModalType, setCurrentModalType] = useState('location');
  
  /**
   * Open a specific category's selection modal
   */
  const openModal = (
    type, 
    title, 
    options, 
    selectedIds
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
  const handleModalSelect = (selectedIds) => {
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
   * Update the date with selected hours and minutes
   */
  const updateSelectedTime = () => {
    try {
      // Create a new date with selected hours/minutes
      const newDate = new Date(date);
      newDate.setHours(selectedHours);
      newDate.setMinutes(selectedMinutes);
      setDate(newDate);
      setShowTimePicker(false);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'update_selected_time' }
      });
    }
  };

  /**
   * Handle date change from the date picker (Android only)
   */
  const onDateChange = (event, selectedDate) => {
    try {
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
      }

      if (selectedDate) {
        setDate(selectedDate);
        setSelectedHours(selectedDate.getHours());
        setSelectedMinutes(selectedDate.getMinutes());
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
   * Format the time only (no date)
   */
  const formatTime = (date) => {
    const options = { 
      hour: 'numeric',
      minute: 'numeric'
    };
    return date.toLocaleString(undefined, options);
  };

  /**
   * Show the time picker (platform-specific)
   */
  const showTimePickerModal = () => {
    try {
      if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
          value: date,
          mode: 'time',
          is24Hour: false,
          onChange: onDateChange,
        });
      } else {
        // Initialize selected hours/minutes from current date
        setSelectedHours(date.getHours());
        setSelectedMinutes(date.getMinutes());
        setShowTimePicker(true);
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'show_time_picker' }
      });
    }
  };

  /**
   * Show the duration picker
   */
  const showDurationPickerModal = () => {
    try {
      // Initialize selected duration from current value
      setSelectedDuration(parseInt(duration, 10) || 0);
      setShowDurationPicker(true);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'show_duration_picker' }
      });
    }
  };

  /**
   * Update the duration with selected value
   */
  const updateSelectedDuration = () => {
    try {
      setDuration(selectedDuration.toString());
      setShowDurationPicker(false);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'update_selected_duration' }
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
    category,
    id
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
  const handleSubmit = async () => {
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
      
      // Prepare payload for API
      const payload = {
        time: date.toISOString(),
        duration: Number(duration) || 5,
        urgeStrength: Number(urgeStrength) || 3,
        intentionType: awarenessType,
        selectedEnvironments: selectedLocations || [],
        selectedActivities: selectedActivities || [],
        selectedEmotions: selectedEmotions || [],
        selectedThoughts: selectedThoughts || [],
        selectedSensations: selectedSensations || [],
        notes: notes.trim() || undefined,
      };
      
      // Submit to API
      try {
        // Store locally for sync later if needed
        const allData = JSON.stringify(payload);
        await SecureStore.setItemAsync('bfrb_all_data', allData);
        
        // Submit to API if authentication service is available
        if (typeof api !== 'undefined' && api.instances && api.instances.createInstance) {
          await api.instances.createInstance(payload);
          
          // Show success message
          Alert.alert(
            'Success',
            'Your BFRB instance has been recorded successfully.',
            [{ 
              text: 'OK', 
              onPress: () => {
                // Navigate to home screen after submitting
                router.replace('/');
              }
            }]
          );
        } else {
          // Just navigate home if API isn't available
          router.replace('/');
        }
      } catch (error) {
        console.error('Error submitting BFRB instance:', error);
        
        // Show error but continue navigation
        Alert.alert(
          'Error',
          'There was a problem submitting your data. It has been saved locally and will sync when connectivity is restored.',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Navigate to home screen after error
              router.replace('/');
            }
          }]
        );
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'ui',
        level: 'error',
        context: { action: 'submit_form' }
      });
      
      // Navigate home even if there's an error
      router.replace('/');
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
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Awareness Type</Text>
          </View>
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
          </View>
        </View>

        {/* Urge Strength */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>How strong was the urge?</Text>
          </View>
          <View style={styles.urgeStrengthContainer}>
            {OptionDictionaries.urgeStrengthOptions
              .filter(option => option.id >= '1' && option.id <= '5')
              .map((option) => (
                <TouchableOpacity 
                  key={option.id}
                  style={[
                    styles.urgeStrengthOption,
                    urgeStrength === option.id && styles.urgeStrengthSelected
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

        {/* Time and Duration (side by side) */}
        <View style={styles.formSection}>
          <View style={styles.timeAndDurationContainer}>
            {/* Time Picker */}
            <View style={styles.timeContainer}>
              <Text style={styles.inputLabel}>When did it occur?</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={showTimePickerModal}
                accessibilityLabel="Select time"
                accessibilityHint="Opens time picker"
                accessibilityRole="button"
              >
                <Text style={styles.timeText}>
                  {formatTime(date)}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Duration Input */}
            <View style={styles.durationContainer}>
              <Text style={styles.inputLabel}>How many minutes?</Text>
              <TouchableOpacity
                style={styles.durationPickerButton}
                onPress={showDurationPickerModal}
                accessibilityLabel="Select duration"
                accessibilityHint="Opens duration picker"
                accessibilityRole="button"
              >
              <Text style={styles.durationText}>
                {duration > 0 ? `${duration} min` : "Did Not Engage"}
              </Text>

              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          
          <View style={styles.selectionContainer}>
            {selectedLocations.length > 0 ? (
              <CategoryPills
                categoryType="location"
                selectedItems={selectedLocations}
                options={OptionDictionaries.locationOptions}
                onToggleItem={toggleCategoryItem}
                onOpenModal={openModal}
              />
            ) : (
              <TouchableOpacity
                onPress={() => openModal(
                  'location',
                  'Select Locations',
                  OptionDictionaries.locationOptions,
                  selectedLocations
                )}
                style={styles.bigAddButton}
                accessibilityLabel="Add locations"
                accessibilityHint="Opens modal to select locations"
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Activity */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Activity</Text>
          </View>
          
          <View style={styles.selectionContainer}>
            {selectedActivities.length > 0 ? (
              <CategoryPills
                categoryType="activity"
                selectedItems={selectedActivities}
                options={OptionDictionaries.activityOptions}
                onToggleItem={toggleCategoryItem}
                onOpenModal={openModal}
              />
            ) : (
              <TouchableOpacity
                onPress={() => openModal(
                  'activity',
                  'Select Activities',
                  OptionDictionaries.activityOptions,
                  selectedActivities
                )}
                style={styles.bigAddButton}
                accessibilityLabel="Add activities"
                accessibilityHint="Opens modal to select activities"
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Emotions */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Emotions</Text>
          </View>
          
          <View style={styles.selectionContainer}>
            {selectedEmotions.length > 0 ? (
              <CategoryPills
                categoryType="emotion"
                selectedItems={selectedEmotions}
                options={OptionDictionaries.emotionOptions}
                onToggleItem={toggleCategoryItem}
                onOpenModal={openModal}
              />
            ) : (
              <TouchableOpacity
                onPress={() => openModal(
                  'emotion',
                  'Select Emotions',
                  OptionDictionaries.emotionOptions,
                  selectedEmotions
                )}
                style={styles.bigAddButton}
                accessibilityLabel="Add emotions"
                accessibilityHint="Opens modal to select emotions"
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Thought Patterns */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Thought Patterns</Text>
          </View>
          
          <View style={styles.selectionContainer}>
            {selectedThoughts.length > 0 ? (
              <CategoryPills
                categoryType="thought"
                selectedItems={selectedThoughts}
                options={OptionDictionaries.thoughtOptions}
                onToggleItem={toggleCategoryItem}
                onOpenModal={openModal}
              />
            ) : (
              <TouchableOpacity
                onPress={() => openModal(
                  'thought',
                  'Select Thought Patterns',
                  OptionDictionaries.thoughtOptions,
                  selectedThoughts
                )}
                style={styles.bigAddButton}
                accessibilityLabel="Add thought patterns"
                accessibilityHint="Opens modal to select thought patterns"
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Physical Sensations */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Physical Sensations</Text>
          </View>
          
          <View style={styles.selectionContainer}>
            {selectedSensations.length > 0 ? (
              <CategoryPills
                categoryType="sensation"
                selectedItems={selectedSensations}
                options={OptionDictionaries.sensationOptions}
                onToggleItem={toggleCategoryItem}
                onOpenModal={openModal}
              />
            ) : (
              <TouchableOpacity
                onPress={() => openModal(
                  'sensation',
                  'Select Physical Sensations',
                  OptionDictionaries.sensationOptions,
                  selectedSensations
                )}
                style={styles.bigAddButton}
                accessibilityLabel="Add physical sensations"
                accessibilityHint="Opens modal to select physical sensations"
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
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

      {/* iOS-style Time Picker Modal */}
      {Platform.OS === 'ios' && (
        <TimePickerModal
          visible={showTimePicker}
          onCancel={() => setShowTimePicker(false)}
          onDone={updateSelectedTime}
          selectedHours={selectedHours}
          selectedMinutes={selectedMinutes}
          setSelectedHours={setSelectedHours}
          setSelectedMinutes={setSelectedMinutes}
        />
      )}
      
      {/* iOS-style Duration Picker Modal */}
      {Platform.OS === 'ios' && (
        <DurationPickerModal
          visible={showDurationPicker}
          onCancel={() => setShowDurationPicker(false)}
          onDone={updateSelectedDuration}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />
      )}

      {/* Answer Selector Modal */}
      <AnswerSelectorModal
        visible={modalVisible}
        title={modalTitle}
        options={modalOptions}
        selectedIds={modalSelected}
        onSelect={handleModalSelect}
        onClose={() => setModalVisible(false)}
        allowMultiple={true}
        allowCustom={true}
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
    alignItems: 'center',
  },
  formSection: {
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    position: 'relative',
    width: '100%',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  // Selection Container
  selectionContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    minHeight: 45, // Minimum height to fit at least one pill
  },
  // Add buttons
  bigAddButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderColor: theme.colors.border.light,
  },
  addButtonText: {
    fontSize: 24,
    color: theme.colors.primary.main,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Awareness Type Styles
  awarenessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: theme.spacing.md,
  },
  toggleLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing.md,
  },
  toggleLabelActive: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.bold,
  },
  // Urge Strength Styles
  urgeStrengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    width: '90%',
    marginVertical: theme.spacing.md,
  },
  urgeStrengthOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.neutral.lighter,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginHorizontal: theme.spacing.xs,
    opacity: 0.7,
  },
  urgeStrengthSelected: {
    backgroundColor: theme.colors.primary.light + '40',
    borderColor: theme.colors.primary.main,
    opacity: 1,
  },
  urgeStrengthEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  urgeStrengthText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
  },
  urgeStrengthTextSelected: {
    color: theme.colors.primary.main,
  },
  // Time and Duration Styles (side by side)
  timeAndDurationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: theme.spacing.md,
  },
  timeContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  durationContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    padding: theme.spacing.md,
    width: '100%',
  },
  timeText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginRight: theme.spacing.sm,
  },
  durationPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral.lighter,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.input,
    padding: theme.spacing.md,
    width: '100%',
  },
  durationText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  // Notes styles
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
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  // Footer styles
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