export { default as CategoryPills } from './CategoryPills';
export { default as EmojiPill } from './EmojiPill';
export { default as TriggerPill } from './TriggerPill';

import CategoryPills from './CategoryPills';
import EmojiPill from './EmojiPill';
import TriggerPill from './TriggerPill';

// Combine form components into a single default export
const FormComponents = {
  CategoryPills,
  EmojiPill,
  TriggerPill
};

export default FormComponents;
