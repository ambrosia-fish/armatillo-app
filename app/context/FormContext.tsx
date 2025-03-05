import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the structure of your form data
interface BFRBFormData {
  // Time screen data
  time?: Date;
  duration?: number;
  
  // Detail screen data
  urgeStrength?: number;
  intentionType?: string;
  
  // Environment screen data
  selectedEnvironments?: string[];
  environmentDetails?: string;
  
  // Feelings screen data
  selectedEmotions?: string[];
  selectedSensations?: string[];
  
  // Thoughts screen data
  selectedThoughts?: string[];
  
  // Notes screen data
  notes?: string;
}

// Define the context type
interface FormContextType {
  formData: BFRBFormData;
  updateFormData: (newData: Partial<BFRBFormData>) => void;
  resetFormData: () => void;
}

// Create context with a default value
const FormContext = createContext<FormContextType | undefined>(undefined);

// Provider props type
interface FormProviderProps {
  children: ReactNode;
}

// Create the provider component
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
  
  // Value to be provided to consumers
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

// Custom hook for using the form context
export function useFormContext() {
  const context = useContext(FormContext);
  
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  
  return context;
}
