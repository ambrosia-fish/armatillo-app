export interface OptionItem {
  id: string;
  label: string;
  emoji: string;
}

// Dictionary for trigger options
export const triggerOptions: OptionItem[] = [
];

// Dictionary for environment options
export const environmentOptions: OptionItem[] = [
  { id: 'home', label: 'home', emoji: '🏠' },
  { id: 'work', label: 'work', emoji: '💼' },
  { id: 'school', label: 'school', emoji: '🏫' },
  { id: 'bathroom', label: 'bathroom', emoji: '🚿' },
  { id: 'bedroom', label: 'bedroom', emoji: '🛏️' },
  { id: 'living_room', label: 'living room', emoji: '🛋️' },
  { id: 'kitchen', label: 'kitchen', emoji: '🍳' },
  { id: 'office', label: 'office', emoji: '🖥️' },
  { id: 'car', label: 'car', emoji: '🚘' },
  { id: 'bus', label: 'bus', emoji: '🚌' },
  { id: 'train', label: 'train', emoji: '🚆' },
  { id: 'airplane', label: 'airplane', emoji: '🛩️' },
  { id: 'gym', label: 'gym', emoji: '🏋️' },
  { id: 'restaurant', label: 'restaurant', emoji: '🍽️' },
  { id: 'cafe', label: 'cafe', emoji: '☕' },
  { id: 'store', label: 'store', emoji: '🛒' },
  { id: 'outdoors', label: 'outdoors', emoji: '🌳' },
  { id: 'library', label: 'library', emoji: '📚' },
  { id: 'theater', label: 'theater', emoji: '🎭' },
  { id: 'hospital', label: 'hospital', emoji: '🩺' },
  { id: 'salon', label: 'salon', emoji: '💇' }
];

// Dictionary for feeling options
export const feelingOptions: OptionItem[] = [
  { id: 'stress', label: 'stress', emoji: '😫' },
  { id: 'worry', label: 'worry', emoji: '😟' },
  { id: 'frustration', label: 'frustration', emoji: '😤' },
  { id: 'boredom', label: 'boredom', emoji: '😒' },
  { id: 'restlessness', label: 'restlessness', emoji: '😬' },
  { id: 'excitement', label: 'excitement', emoji: '😃' },
  { id: 'pressure', label: 'pressure', emoji: '😓' },
  { id: 'tired', label: 'tired', emoji: '🥱' },
  { id: 'anxiety', label: 'anxiety', emoji: '😰' },
  { id: 'overwhelmed', label: 'overwhelmed', emoji: '🥴' },
  { id: 'sadness', label: 'sadness', emoji: '😢' },
  { id: 'anger', label: 'anger', emoji: '😠' },
  { id: 'guilt', label: 'guilt', emoji: '😣' },
  { id: 'shame', label: 'shame', emoji: '😞' },
  { id: 'loneliness', label: 'loneliness', emoji: '🥺' },
  { id: 'fear', label: 'fear', emoji: '😨' },
  { id: 'disgust', label: 'disgust', emoji: '🤢' },
  { id: 'numbness', label: 'numbness', emoji: '😶' },
  { id: 'despair', label: 'despair', emoji: '😩' },
  { id: 'hope', label: 'hope', emoji: '🤗' },
  { id: 'joy', label: 'joy', emoji: '😊' },
  { id: 'satisfaction', label: 'satisfaction', emoji: '😏' },
  { id: 'irritation', label: 'irritation', emoji: '😑' },
  { id: 'disappointment', label: 'disappointment', emoji: '😔' },
  { id: 'confusion', label: 'confusion', emoji: '😕' },
  { id: 'emptiness', label: 'emptiness', emoji: '🫥' },
  { id: 'jealousy', label: 'jealousy', emoji: '😒' },
  { id: 'embarrassment', label: 'embarrassment', emoji: '😳' },
  { id: 'nervous', label: 'nervous', emoji: '😖' },
  { id: 'distracted', label: 'distracted', emoji: '🤔' },
  { id: 'relaxed', label: 'relaxed', emoji: '😌' },
  { id: 'grief', label: 'grief', emoji: '💔' },
  { id: 'insecurity', label: 'insecurity', emoji: '🙁' },
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
  { id: 'headache', label: 'headache', emoji: '🤯' },
  { id: 'nausea', label: 'nausea', emoji: '🤢' },
  { id: 'dizziness', label: 'dizziness', emoji: '💫' },
  { id: 'thirst', label: 'thirst', emoji: '🥤' },
  { id: 'sweating', label: 'sweating', emoji: '💦' },
  { id: 'chills', label: 'chills', emoji: '🥶' },
  { id: 'pressure', label: 'pressure', emoji: '👇' },
  { id: 'cramps', label: 'cramps', emoji: '😖' },
  { id: 'stiffness', label: 'stiffness', emoji: '🧍' },
  { id: 'soreness', label: 'soreness', emoji: '💪' },
  { id: 'restlessness', label: 'restlessness', emoji: '🔄' },
  { id: 'heaviness', label: 'heaviness', emoji: '⚓' },
  { id: 'pulsing', label: 'pulsing', emoji: '💓' },
  { id: 'twitching', label: 'twitching', emoji: '👁️' },
  { id: 'hot_flash', label: 'hot flash', emoji: '🌡️' },
  { id: 'dry_skin', label: 'dry skin', emoji: '🏜️' },
  { id: 'congestion', label: 'congestion', emoji: '🤧' },
  { id: 'bumpy_texture', label: 'bumpy texture', emoji: '🧶' },
  { id: 'rough_spot', label: 'rough spot', emoji: '🧩' },
  { id: 'asymmetry', label: 'asymmetry', emoji: '⚖️' },
  { id: 'racing_heart', label: 'racing heart', emoji: '💗' },
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
  { id: 'self_criticism', label: 'self-criticism', emoji: '👎' },
  { id: 'worry', label: 'worry', emoji: '😟' },
  { id: 'self_doubt', label: 'self-doubt', emoji: '🤔' },
  { id: 'comparing', label: 'comparing to others', emoji: '⚖️' },
  { id: 'catastrophizing', label: 'catastrophizing', emoji: '💥' },
  { id: 'all_or_nothing', label: 'all-or-nothing', emoji: '⚫⚪' },
  { id: 'should_statements', label: 'should statements', emoji: '📝' },
  { id: 'mind_reading', label: 'mind reading', emoji: '🔮' },
  { id: 'fortune_telling', label: 'fortune telling', emoji: '🧿' },
  { id: 'focusing_negative', label: 'focusing on negative', emoji: '🔍' },
  { id: 'minimizing_positive', label: 'minimizing positive', emoji: '➖' },
  { id: 'symmetry', label: 'symmetry concerns', emoji: '↔️' },
  { id: 'imperfection', label: 'noticing imperfection', emoji: '⭕' },
  { id: 'overwhelm', label: 'feeling overwhelmed', emoji: '🌊' },
  { id: 'escape', label: 'wanting to escape', emoji: '🚪' },
  { id: 'anticipation', label: 'anticipation', emoji: '⏳' },
  { id: 'regret', label: 'regret', emoji: '😔' },
  { id: 'just_right', label: 'just right feeling', emoji: '👌' },
  { id: 'guilt', label: 'guilt', emoji: '😣' },
  { id: 'zoning_out', label: 'zoning out', emoji: '🧠' },
  { id: 'hyperfocus', label: 'hyperfocus', emoji: '🎯' },
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
  { id: 'roughness', label: 'roughness', emoji: '🧱' },
  { id: 'smoothness', label: 'smoothness', emoji: '🪨' },
  { id: 'dryness', label: 'dryness', emoji: '🏜️' },
  { id: 'moisture', label: 'moisture', emoji: '💦' },
  { id: 'vibration', label: 'vibration', emoji: '📳' },
  { id: 'noise', label: 'noise', emoji: '🔊' },
  { id: 'bright_light', label: 'bright light', emoji: '☀️' },
  { id: 'dim_light', label: 'dim light', emoji: '🌙' },
  { id: 'cold', label: 'cold', emoji: '❄️' },
  { id: 'heat', label: 'heat', emoji: '🔥' },
  { id: 'itchiness', label: 'itchiness', emoji: '🪶' },
  { id: 'pain', label: 'pain', emoji: '😖' },
  { id: 'tightness', label: 'tightness', emoji: '🔒' },
  { id: 'stickiness', label: 'stickiness', emoji: '🍯' },
  { id: 'irregularity', label: 'irregularity', emoji: '〰️' },
];

// Create a wrapper object for default export
const OptionDictionaries = {
  triggerOptions,
  environmentOptions,
  feelingOptions,
  sensationOptions,
  thoughtOptions,
  sensoryOptions
};

export default OptionDictionaries;
