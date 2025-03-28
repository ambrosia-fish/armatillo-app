/**
 * Standardized Instance interface for BFRB tracking data
 */
export interface Instance {
  _id: string;
  userId?: string;
  userEmail?: string;
  user_id: string;
  
  // Timestamp fields
  time: string;            // ISO string representing when the instance occurred
  
  // Core tracking fields
  duration: number | string;   // Duration in minutes or string format
  urgeStrength?: number;       // Scale of 1-10
  intentionType: string;       // 'automatic' or 'intentional'
  
  // Selected categories (arrays of option IDs)
  selectedEnvironments?: string[];
  selectedEmotions?: string[];
  selectedSensations?: string[];
  selectedThoughts?: string[];
  selectedSensoryTriggers?: string[];
  
  // Optional detail fields for each category
  mentalDetails?: string;
  physicalDetails?: string;
  thoughtDetails?: string;
  environmentDetails?: string;
  sensoryDetails?: string;
  
  // Additional fields
  location?: string;
  activity?: string;
  notes?: string;
}

/**
 * Helper function to normalize instance data to the standardized format
 */
export const normalizeInstance = (data: any): Instance => {
  return {
    ...data,
    // Use time field, fall back to createdAt for legacy data
    time: data.time || data.createdAt,
    
    // Use intentionType, convert from automatic for legacy data
    intentionType: data.intentionType || (data.automatic !== undefined 
      ? (data.automatic ? 'automatic' : 'intentional') 
      : 'automatic'),
      
    // Ensure duration exists
    duration: data.duration || 5,
    
    // Use selectedEmotions, fall back to feelings for legacy data
    selectedEmotions: data.selectedEmotions || data.feelings || [],
    
    // Use selectedEnvironments, fall back to environment for legacy data
    selectedEnvironments: data.selectedEnvironments || data.environment || [],
    
    // Use selectedThoughts, convert from thoughts for legacy data
    selectedThoughts: data.selectedThoughts || 
      (data.thoughts ? [data.thoughts] : []),
  };
};

/**
 * Function to prepare an instance for sending to the API
 */
export const prepareInstanceForApi = (instance: Partial<Instance>) => {
  return {
    ...instance,
    // Convert time to ISO string if it's a Date object
    time: instance.time instanceof Date ? instance.time.toISOString() : instance.time,
  };
};

export default Instance;