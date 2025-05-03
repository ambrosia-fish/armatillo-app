import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useFormContext } from '@/app/store/contexts/FormContext';
import { errorService } from '@/app/services/error/ErrorService';
import api from '@/app/services/api/base';
import { OptionItem } from '@/app/constants/options';

export type CategoryType = 'location' | 'activity' | 'emotion' | 'thought' | 'sensation';

export default function useEntryForm() {
  const { formData, updateFormData, submitForm, isSubmitting } = useFormContext();
  
  /**
   * Format a duration in minutes to a display string
   */
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return 'Did Not Engage';
    if (minutes >= 60) return '1 hr+';
    return `${minutes} min`;
  };
  
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
  const [selectedDuration, setSelectedDuration] = useState(
    parseInt(formData.duration?.toString() || '5', 10)
  );
  const [duration, setDuration] = useState(
    formatDuration(parseInt(formData.duration?.toString() || '5', 10))
  );
  const [showDurationPicker, setShowDurationPicker] = useState(false);

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
  const [awarenessType, setAwarenessType] = useState<'automatic' | 'intentional'>(
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
  const [modalOptions, setModalOptions] = useState<OptionItem[]>([]);
  const [modalSelected, setModalSelected] = useState<string[]>([]);
  const [currentModalType, setCurrentModalType] = useState<CategoryType>('location');
  
  // Load form data from context when available
  useEffect(() => {
    if (formData.time) {
      setDate(formData.time);
      setSelectedHours(formData.time.getHours());
      setSelectedMinutes(formData.time.getMinutes());
    }
    
    if (formData.duration) {
      setDuration(formatDuration(parseInt(formData.duration.toString(), 10)));
      setSelectedDuration(parseInt(formData.duration.toString(), 10));
    }
    
    if (formData.selectedLocations) {
      setSelectedLocations(formData.selectedLocations);
    }
    
    if (formData.selectedActivities) {
      setSelectedActivities(formData.selectedActivities);
    }
    
    if (formData.selectedEmotions) {
      setSelectedEmotions(formData.selectedEmotions);
    }
    
    if (formData.selectedThoughts) {
      setSelectedThoughts(formData.selectedThoughts);
    }
    
    if (formData.selectedSensations) {
      setSelectedSensations(formData.selectedSensations);
    }
    
    if (formData.awarenessType) {
      setAwarenessType(formData.awarenessType);
    }
    
    if (formData.urgeStrength) {
      setUrgeStrength(formData.urgeStrength.toString());
    }
    
    if (formData.notes) {
      setNotes(formData.notes);
    }
  }, [formData]);
  
  /**
   * Open a specific category's selection modal
   */
  const openModal = (
    type: CategoryType, 
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
  const onDateChange = (event: any, selectedDate?: Date) => {
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
  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
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
      // No need to parse as integer here since selectedDuration is already a number
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
      setDuration(formatDuration(selectedDuration));
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
    category: CategoryType,
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
  const handleSubmit = async () => {
    // Update form data with all values
    updateFormData({
      // Time data
      time: date,
      duration: selectedDuration,
      
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
      duration: selectedDuration,
      urgeStrength: Number(urgeStrength) || 3,
      intentionType: awarenessType,
      selectedEnvironments: selectedLocations || [],
      selectedActivities: selectedActivities || [],
      selectedEmotions: selectedEmotions || [],
      selectedThoughts: selectedThoughts || [],
      selectedSensations: selectedSensations || [],
      notes: notes.trim() || undefined,
    };
    
    // Submit to API with standardized handling
    await submitForm(
      async () => {
        // Store locally for sync later if needed
        const allData = JSON.stringify(payload);
        
        if (Platform.OS === 'web') {
          // Use localStorage for web
          localStorage.setItem('bfrb_all_data', allData);
        } else {
          // Use SecureStore for native platforms
          await SecureStore.setItemAsync('bfrb_all_data', allData);
        }
        
        // Submit to API if authentication service is available
        if (typeof api !== 'undefined' && api.instances && api.instances.createInstance) {
          return api.instances.createInstance(payload);
        }
        
        return null;
      },
      {
        successMessage: 'Your BFRB instance has been recorded successfully.',
        errorMessage: 'There was a problem submitting your data. It has been saved locally and will sync when connectivity is restored.',
        navigationPath: '/',
        context: { 
          screen: 'new_entry',
          payloadSize: JSON.stringify(payload).length 
        }
      }
    );
  };

  return {
    // State
    date,
    showTimePicker,
    selectedHours,
    selectedMinutes,
    duration,
    showDurationPicker,
    selectedDuration,
    selectedLocations,
    selectedActivities,
    selectedEmotions,
    selectedThoughts,
    selectedSensations,
    awarenessType,
    urgeStrength,
    notes,
    modalVisible,
    modalTitle,
    modalOptions,
    modalSelected,
    currentModalType,
    isSubmitting,
    
    // State update functions
    setDate,
    setShowTimePicker,
    setSelectedHours,
    setSelectedMinutes,
    setDuration,
    setShowDurationPicker,
    setSelectedDuration,
    setSelectedLocations,
    setSelectedActivities,
    setSelectedEmotions,
    setSelectedThoughts,
    setSelectedSensations,
    setAwarenessType,
    setUrgeStrength,
    setNotes,
    setModalVisible,
    setModalTitle,
    setModalOptions,
    setModalSelected,
    setCurrentModalType,
    
    // Methods
    openModal,
    handleModalSelect,
    toggleCategoryItem,
    updateSelectedTime,
    onDateChange,
    formatTime,
    formatDuration,
    showTimePickerModal,
    showDurationPickerModal,
    updateSelectedDuration,
    toggleAwarenessType,
    handleSubmit,
  };
}