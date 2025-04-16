/**
 * Components barrel file
 * 
 * Exports all themed and shared components for easy importing.
 * Use this to import multiple components in a single line:
 * 
 * import { Button, Input, Card, Header, Text, View } from './components';
 */

// Themed UI components
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';
export { default as Header } from './Header';
export { Text, View } from './Themed';

// Authentication components
export { default as AuthGuard } from './AuthGuard';

// Form entry components
export { default as EmojiPill } from './EmojiPill';
export { default as CategoryPills } from './CategoryPills';
export { default as AnswerSelectorModal } from '../screens/modals/answer-selector-modal';

// Visualization components
export { default as TriggerPatterns } from './TriggerPatterns';

// Existing components
export { default as InstanceDetailsModal } from '../screens/modals/instance-details-modal';
export default {};