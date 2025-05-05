import React, { createContext, useContext, useState, ReactNode } from 'react';
import { handleFormSubmission } from '@/app/utils';
import { errorService, ErrorMessages } from '@/app/services/error';

// Add specific typing for tracking screen selections
interface BFRBFormData {
  // Meta information
  name?: string;
  notes?: string;
  
  // Time tracking
  time?: Date;
  duration?: number;
  selectedTime?: string;
  selectedDuration?: string;
  
  // Urge tracking
  urgeStrength?: number | string;
  awarenessType?: string;
  
  // Physical/Location tracking
  selectedLocations?: string[];
  locationDetails?: string;
  
  // Activity tracking
  selectedActivities?: string[];
  activityDetails?: string;
  
  // Emotional tracking
  selectedEmotions?: string[];
  emotionDetails?: string;
  
  // Cognitive tracking
  selectedThoughts?: string[];
  thoughtDetails?: string;

  // Physical sensations
  selectedSensations?: string[];
  sensationDetails?: string;
  
  // Legacy fields - maintained for backwards compatibility
  intentionType?: string;
  selectedEnvironments?: string[];
  environmentDetails?: string;
  selectedSensoryTriggers?: string[];
  userName?: string;
}

/**
 * Interface for form submission options
 */
interface FormSubmissionOptions {
  successMessage?: string;
  errorMessage?: string;
  navigationPath?: string;
  context?: Record<string, any>;
  resetOnSuccess?: boolean;
}

interface FormContextType {
  formData: BFRBFormData;
  updateFormData: (newData: Partial<BFRBFormData>) => void;
  resetFormData: () => void;
  submitForm: <T>(
    submitAction: () => Promise<T>,
    options?: FormSubmissionOptions
  ) => Promise<T | null>;
  isSubmitting: boolean;
  submissionError: Error | null;
  validateForm: (validationRules?: Record<string, (value: any) => string | null>) => boolean;
  formErrors: Record<string, string>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps {
  children: ReactNode;
}

export function FormProvider({ children }: FormProviderProps) {
  const [formData, setFormData] = useState<BFRBFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<Error | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  /**
   * Update form data with new values
   */
  const updateFormData = (newData: Partial<BFRBFormData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...newData
    }));
    
    // Clear errors for fields that have been updated
    if (Object.keys(formErrors).length > 0) {
      const updatedErrors = { ...formErrors };
      Object.keys(newData).forEach(key => {
        if (updatedErrors[key]) {
          delete updatedErrors[key];
        }
      });
      setFormErrors(updatedErrors);
    }
  };
  
  /**
   * Reset form data to empty state
   */
  const resetFormData = () => {
    setFormData({});
    setFormErrors({});
  };
  
  /**
   * Validate form data against provided rules
   */
  const validateForm = (validationRules: Record<string, (value: any) => string | null> = {}) => {
    const errors: Record<string, string> = {};
    
    // Apply each validation rule to the corresponding form field
    Object.entries(validationRules).forEach(([field, validator]) => {
      const value = formData[field as keyof BFRBFormData];
      const errorMessage = validator(value);
      
      if (errorMessage) {
        errors[field] = errorMessage;
      }
    });
    
    // Update form errors state
    setFormErrors(errors);
    
    // Return true if no errors were found
    return Object.keys(errors).length === 0;
  };
  
  /**
   * Submit form with standardized handling
   */
  const submitForm = async <T,>(
    submitAction: () => Promise<T>,
    options: FormSubmissionOptions = {}
  ): Promise<T | null> => {
    // Set default options
    const {
      successMessage = 'Form submitted successfully',
      errorMessage = ErrorMessages.FORM.SUBMISSION_FAILED,
      navigationPath,
      context = {},
      resetOnSuccess = true
    } = options;
    
    // Mark form as submitting
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      // Handle form submission with standardized error handling
      const result = await handleFormSubmission({
        submitAction,
        successMessage,
        errorMessage,
        navigationPath,
        context: { 
          ...context, 
          formData: JSON.stringify(formData).substring(0, 500) // Truncate for log readability
        },
      });
      
      // Reset form data on successful submission if requested
      if (resetOnSuccess) {
        resetFormData();
      }
      
      return result;
    } catch (error) {
      // Save the error for reference
      setSubmissionError(error instanceof Error ? error : new Error(String(error)));
      
      // Log with error service
      errorService.handleFormError(error instanceof Error ? error : String(error), {
        context: { 
          action: 'form_submission',
          formContext: true,
          ...context,
        }
      });
      
      return null;
    } finally {
      // Mark form as no longer submitting
      setIsSubmitting(false);
    }
  };
  
  // Provide context value to consumers
  const value = {
    formData,
    updateFormData,
    resetFormData,
    submitForm,
    isSubmitting,
    submissionError,
    validateForm,
    formErrors
  };
  
  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  
  return context;
}

const Form = {
  FormProvider,
  useFormContext
};

export default Form;
