import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface FormContextType {
  formData: BFRBFormData;
  updateFormData: (newData: Partial<BFRBFormData>) => void;
  resetFormData: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps {
  children: ReactNode;
}

export function FormProvider({ children }: FormProviderProps) {
  const [formData, setFormData] = useState<BFRBFormData>({});
  
  const updateFormData = (newData: Partial<BFRBFormData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...newData
    }));
  };
  
  const resetFormData = () => {
    setFormData({});
  };
  
  const value = {
    formData,
    updateFormData,
    resetFormData
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