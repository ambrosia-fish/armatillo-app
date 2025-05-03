import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share, Platform, Alert } from 'react-native';
import OptionDictionaries from '@/app/constants/options';
import { errorService } from '../services/ErrorService';

// Instance type definition
export interface Instance {
  _id: string;
  userId?: string;
  userEmail?: string;
  user_id: string;
  time: string;
  duration: number | string;
  urgeStrength?: number;
  intentionType: string; // 'automatic' or 'intentional'
  selectedEnvironments?: string[];
  selectedEmotions?: string[];
  selectedSensations?: string[];
  selectedThoughts?: string[];
  selectedSensoryTriggers?: string[];
  mentalDetails?: string;
  physicalDetails?: string;
  thoughtDetails?: string;
  environmentDetails?: string;
  sensoryDetails?: string;
  notes?: string;
}

// Helper function to convert option IDs to readable labels
const getOptionLabels = (optionIds?: string[], optionList?: any[]) => {
  if (!optionIds || !optionList) return '';
  
  return optionIds.map(id => {
    const option = optionList.find(opt => opt.id === id);
    return option ? option.label : id;
  }).join(', ');
};

// Format date for CSV (MM/DD/YYYY format)
const formatCSVDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'numeric', 
    day: 'numeric', 
    year: 'numeric'
  });
};

// Format time for CSV (HH:MM:SS AM/PM format)
const formatCSVTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// Function to convert instances to CSV format
export const convertToCSV = (data: Instance[]) => {
  // Define CSV headers
  const headers = [
    'Date',
    'Time',
    'Urge Strength',
    'Type',
    'Duration',
    'Emotions',
    'Physical Sensations',
    'Thoughts',
    'Environment',
    'Notes'
  ];

  // Create CSV content starting with headers
  let csvContent = headers.join(',') + '\n';

  // Add data rows
  data.forEach(instance => {
    // Get type display text
    const type = instance.intentionType === 'automatic' ? 'Automatic' : 'Intentional';
      
    // Format duration
    const duration = instance.duration 
      ? (typeof instance.duration === 'number' ? `${instance.duration} min` : instance.duration) 
      : '';
      
    // Get emotions labels
    const emotions = instance.selectedEmotions 
      ? getOptionLabels(instance.selectedEmotions, OptionDictionaries.emotionOptions)
      : '';
      
    // Get environment labels
    const environment = instance.selectedEnvironments 
      ? getOptionLabels(instance.selectedEnvironments, OptionDictionaries.environmentOptions)
      : '';
      
    // Get sensation labels
    const sensations = instance.selectedSensations 
      ? getOptionLabels(instance.selectedSensations, OptionDictionaries.sensationOptions)
      : '';
      
    // Get thought labels
    const thoughts = instance.selectedThoughts 
      ? getOptionLabels(instance.selectedThoughts, OptionDictionaries.thoughtOptions)
      : '';

    // Function to escape quotes and handle fields
    const escapeField = (field: any) => {
      if (field === undefined || field === null || field === '') return '';
      const stringField = String(field);
      return `"${stringField.replace(/"/g, '""')}"`;
    };

    // Create row with proper data types and escaped quotes
    const row = [
      formatCSVDate(instance.time), // Date only
      formatCSVTime(instance.time), // Time only
      instance.urgeStrength !== undefined ? instance.urgeStrength : '', // Urge Strength
      escapeField(type), // Type
      escapeField(duration), // Duration
      escapeField(emotions), // Emotions
      escapeField(sensations), // Physical Sensations
      escapeField(thoughts), // Thoughts
      escapeField(environment), // Environment
      escapeField(instance.notes) // Notes
    ];
    
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
};

// Function to export instances as CSV
export const exportInstancesAsCSV = async (instances: Instance[]) => {
  try {
    if (instances.length === 0) {
      Alert.alert('No Data', 'There is no history data to export.');
      return false;
    }

    // Convert instances to CSV format
    const csvContent = convertToCSV(instances);
    
    // Generate file name with current date
    const fileName = `armatillo_history_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (Platform.OS === 'web') {
      // For web: create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For mobile: save file and share
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Tracking History',
          UTI: 'public.comma-separated-values-text'
        });
      } else {
        // Fallback to Share API if Sharing is not available
        await Share.share({
          title: 'Armatillo History Data',
          message: 'Armatillo History Data: ' + csvContent
        });
      }
    }
    
    return true;
  } catch (error) {
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'ui', // Using 'ui' as a valid ErrorSource since this is user-interface related
      level: 'error',
      displayToUser: true,
      context: { action: 'exportInstancesAsCSV', instanceCount: instances.length }
    });
    
    Alert.alert(
      'Export Failed',
      'Could not export data. Please try again later.'
    );
    return false;
  }
};
export default {};