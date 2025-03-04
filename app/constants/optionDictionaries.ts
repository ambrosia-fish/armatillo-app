export interface OptionItem {
  id: string;
  label: string;
  emoji: string;
}

// Dictionary for trigger options
export const triggerOptions: OptionItem[] = [
  { id: 'anger', label: 'anger', emoji: '😠' },
  { id: 'sadness', label: 'sadness', emoji: '😢' },
  { id: 'anxiety', label: 'anxiety', emoji: '😰' },
  { id: 'tiredness', label: 'tiredness', emoji: '😴' },
  { id: 'boredom', label: 'boredom', emoji: '🥱' },
  { id: 'hunger', label: 'hunger', emoji: '🍕' },
  { id: 'thought', label: 'thought', emoji: '🧠' },
  { id: 'social', label: 'social', emoji: '👥' },
  { id: 'tech', label: 'tech', emoji: '📱' },
];

// Dictionary for environment options
export const environmentOptions: OptionItem[] = [
  { id: 'home', label: 'home', emoji: '🏠' },
  { id: 'work', label: 'work', emoji: '💼' },
  { id: 'school', label: 'school', emoji: '🏫' },
  { id: 'transit', label: 'transit', emoji: '🚗' },
  { id: 'outdoors', label: 'outdoors', emoji: '🌳' },
  { id: 'shopping', label: 'shopping', emoji: '🛒' },
  { id: 'restaurant', label: 'restaurant', emoji: '🍽️' },
  { id: 'bathroom', label: 'bathroom', emoji: '🚿' },
  { id: 'bedroom', label: 'bedroom', emoji: '🛏️' },
];

// Dictionary for feeling options
export const feelingOptions: OptionItem[] = [
  { id: 'stress', label: 'stress', emoji: '😫' },
  { id: 'worry', label: 'worry', emoji: '😟' },
  { id: 'frustration', label: 'frustration', emoji: '😤' },
  { id: 'boredom', label: 'boredom', emoji: '😒' },
  { id: 'contentment', label: 'contentment', emoji: '😌' },
  { id: 'restlessness', label: 'restlessness', emoji: '😬' },
  { id: 'excitement', label: 'excitement', emoji: '😃' },
  { id: 'pressure', label: 'pressure', emoji: '😓' },
  { id: 'tired', label: 'tired', emoji: '🥱' },
];

// Dictionary for physical sensation options
export const sensationOptions: OptionItem[] = [
  { id: 'tension', label: 'tension', emoji: '🔄' },
  { id: 'energy', label: 'energy', emoji: '⚡' },
  { id: 'fatigue', label: 'fatigue', emoji: '💤' },
  { id: 'tingling', label: 'tingling', emoji: '✨' },
  { id: 'itch', label: 'itch', emoji: '👆' },
  { id: 'pain', label: 'pain', emoji: '🤕' },
  { id: 'burning', label: 'burning', emoji: '🔥' },
  { id: 'numbness', label: 'numbness', emoji: '❄️' },
  { id: 'hunger', label: 'hunger', emoji: '🍕' },
];

// Dictionary for thought pattern options
export const thoughtOptions: OptionItem[] = [
  { id: 'perfectionism', label: 'perfectionism', emoji: '✅' },
  { id: 'rumination', label: 'rumination', emoji: '🔄' },
  { id: 'anxiety', label: 'anxious thoughts', emoji: '⚠️' },
  { id: 'boredom', label: 'boredom', emoji: '🥱' },
  { id: 'appearance', label: 'appearance', emoji: '👀' },
  { id: 'fixing', label: 'fixing/evening', emoji: '🛠️' },
  { id: 'smoothing', label: 'smoothing', emoji: '🖐️' },
  { id: 'distracted', label: 'distracted', emoji: '💭' },
  { id: 'stressed', label: 'stressed', emoji: '😫' },
];

// Dictionary for sensory trigger options
export const sensoryOptions: OptionItem[] = [
  { id: 'visual', label: 'visual', emoji: '👁️' },
  { id: 'texture', label: 'texture', emoji: '🧶' },
  { id: 'sound', label: 'sound', emoji: '👂' },
  { id: 'smell', label: 'smell', emoji: '👃' },
  { id: 'taste', label: 'taste', emoji: '👅' },
  { id: 'light', label: 'light', emoji: '💡' },
  { id: 'temperature', label: 'temperature', emoji: '🌡️' },
  { id: 'touch', label: 'touch', emoji: '👆' },
  { id: 'pressure', label: 'pressure', emoji: '⬇️' },
];
