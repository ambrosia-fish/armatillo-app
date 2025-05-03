import { apiRequest } from './api';
import { OptionItem } from '@/app/constants/options';

// Trigger object interface
export interface TriggerObject {
  id: string;
  label: string;
  emoji: string;
}

// Strategy interface
export interface Strategy {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: string | TriggerObject; 
  useCount?: number; // Added useCount field
  competingResponses: Array<{
    _id: string;
    title: string;
    action: string;
    isActive: boolean;
  }>;
  stimulusControls: Array<{
    _id: string;
    title: string;
    action: string;
    isActive: boolean;
  }>;
  communitySupports: Array<{
    _id: string;
    name: string;
    relationship: string;
    contactInfo: string;
    action: string;
    isActive: boolean;
  }>;
  notifications: Array<{
    _id: string;
    message: string;
    frequency: string;
    time: Date;
    isActive: boolean;
  }>;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for creating a strategy - exactly matches what the API expects
export interface CreateStrategyData {
  name: string;
  description?: string;
  trigger: string;
  isActive?: boolean;
  competingResponses?: Array<{
    title: string;
    action?: string;
    isActive?: boolean;
  }>;
  stimulusControls?: Array<{
    title: string;
    action?: string;
    isActive?: boolean;
  }>;
  communitySupports?: Array<{
    name: string;
    relationship?: string;
    contactInfo?: string;
    action?: string;
    isActive?: boolean;
  }>;
  notifications?: Array<{
    message: string;
    frequency?: string;
    time?: Date;
    isActive?: boolean;
  }>;
}

/**
 * API functions for strategies
 */
export const strategiesApi = {
  /**
   * Get all strategies
   */
  getStrategies: async (): Promise<Strategy[]> => {
    return apiRequest('/strategies', { method: 'GET' });
  },
  
  /**
   * Get strategy by ID
   */
  getStrategy: async (id: string): Promise<Strategy> => {
    return apiRequest(`/strategies/${id}`, { method: 'GET' });
  },
  
  /**
   * Get strategies by trigger
   */
  getStrategiesByTrigger: async (triggerId: string): Promise<Strategy[]> => {
    return apiRequest(`/strategies/trigger/${triggerId}`, { method: 'GET' });
  },
  
  /**
   * Create a new strategy
   */
  createStrategy: async (strategyData: CreateStrategyData): Promise<Strategy> => {
    // Ensure we're sending a proper trigger ID string
    const data = {
      ...strategyData,
      // If trigger is an object, extract just the ID
      trigger: typeof strategyData.trigger === 'object' 
        ? strategyData.trigger.id 
        : strategyData.trigger
    };
    
    console.log('Sending to API:', JSON.stringify(data, null, 2));
    
    // Fix: Use body instead of data to properly send the request payload
    return apiRequest('/strategies', { 
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  /**
   * Update a strategy
   */
  updateStrategy: async (id: string, strategyData: Partial<Strategy>): Promise<Strategy> => {
    // Handle trigger field properly for updates too
    const data = { ...strategyData };
    
    if (data.trigger && typeof data.trigger === 'object') {
      data.trigger = data.trigger.id;
    }
    
    // Fix: Use body instead of data to properly send the request payload
    return apiRequest(`/strategies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  /**
   * Delete a strategy
   */
  deleteStrategy: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/strategies/${id}`, { method: 'DELETE' });
  },
  
  /**
   * Toggle strategy active status
   */
  toggleStrategyStatus: async (id: string): Promise<Strategy> => {
    return apiRequest(`/strategies/${id}/toggle-status`, { method: 'PUT' });
  },
  
  /**
   * Increment strategy use count
   */
  incrementStrategyUseCount: async (id: string): Promise<Strategy> => {
    return apiRequest(`/strategies/${id}/increment-use-count`, { method: 'PUT' });
  },
  
  /**
   * Helper function to get trigger ID from a strategy
   * Works with both string and object formats
   */
  getTriggerId: (strategy: Strategy): string => {
    if (typeof strategy.trigger === 'string') {
      return strategy.trigger;
    } else if (strategy.trigger && typeof strategy.trigger === 'object') {
      return strategy.trigger.id;
    }
    return '';
  }
};

export default strategiesApi;