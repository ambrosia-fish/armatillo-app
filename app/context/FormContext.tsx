import React, { createContext, useContext, useState, ReactNode } from 'react';

// Add specific typing for tracking screen selections
interface BFRBFormData {
  // Time tracking
  time?: Date;
  duration?: number;
  selectedTime?: string;
  selectedDuration?: string;
  
  // Urge tracking
  urgeStrength?: number;
  intentionType?: string;
  
  // Environment tracking
  selectedEnvironments?: string[];
  environmentDetails?: string;
  
  // Emotional/Physical tracking
  selectedEmotions?: string[];
  selectedSensations?: string[];
  
  // Cognitive tracking
  selectedThoughts?: string[];

  // Sensory triggers
  selectedSensoryTriggers?: string[];
  notes?: string;

  // User data
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