import { Platform } from 'react-native';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { errorService } from '../services/ErrorService';

/**
 * Interface for form submission options
 */
interface FormSubmissionOptions {
  submitAction: () => Promise<any>;
  successMessage: string;
  errorMessage: string;
  navigationPath?: string;
  context?: Record<string, any>;
}

/**
 * Interface for alert options
 */
interface AlertOptions {
  title: string;
  message: string;
  navigationPath?: string;
}

/**
 * Cross-platform alert with navigation callback
 */
export const showAlert = ({
  title,
  message,
  navigationPath,
}: AlertOptions): void => {
  if (Platform.OS === 'web') {
    // For web: Alert then navigate
    window.alert(`${title}: ${message}`);
    if (navigationPath) {
      router.replace(navigationPath);
    }
  } else {
    // For native: Alert with navigation in callback
    Alert.alert(
      title,
      message,
      [{ 
        text: 'OK', 
        onPress: () => {
          if (navigationPath) {
            router.replace(navigationPath);
          }
        }
      }]
    );
  }
};

/**
 * Standard form submission handler with consistent error handling and navigation
 */
export const handleFormSubmission = async ({
  submitAction,      // The async function that submits the form data
  successMessage,    // Message to display on success
  errorMessage,      // Default error message if no specific error provided
  navigationPath,    // Where to navigate on completion (success or error)
  context = {},      // Additional context for error logging
}: FormSubmissionOptions): Promise<any> => {
  try {
    // Attempt the submission
    const result = await submitAction();
    
    // Show success message using a platform-consistent approach
    showAlert({
      title: 'Success',
      message: successMessage,
      navigationPath,
    });
    
    return result;
  } catch (error) {
    // Log error with the error service
    errorService.handleError(error instanceof Error ? error : String(error), {
      source: 'form',
      level: 'error',
      context: { action: 'form_submission', ...context },
    });
    
    // Show error message using a platform-consistent approach
    showAlert({
      title: 'Error',
      message: error instanceof Error ? error.message : errorMessage,
      navigationPath,
    });
    
    return null;
  }
};
