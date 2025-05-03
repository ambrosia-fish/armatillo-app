#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Directory mapping for the reorganization
const migrations = [
  // Assets
  { from: 'assets/fonts/SpaceMono-Regular.ttf', to: 'app/assets/fonts/SpaceMono-Regular.ttf' },
  { from: 'assets/images/adaptive-icon.png', to: 'app/assets/images/adaptive-icon.png' },
  { from: 'assets/images/armatillo-placeholder-logo.png', to: 'app/assets/images/armatillo-placeholder-logo.png' },
  { from: 'assets/images/favicon.png', to: 'app/assets/images/favicon.png' },
  { from: 'assets/images/icon.png', to: 'app/assets/images/icon.png' },
  { from: 'assets/images/old_.png', to: 'app/assets/images/old_.png' },
  { from: 'assets/images/splash-icon.png', to: 'app/assets/images/splash-icon.png' },
  
  // Components - Common
  { from: 'app/components/AuthGuard.tsx', to: 'app/components/common/AuthGuard/AuthGuard.tsx' },
  { from: 'app/components/Button.tsx', to: 'app/components/common/Button/Button.tsx' },
  { from: 'app/components/Card.tsx', to: 'app/components/common/Card/Card.tsx' },
  { from: 'app/components/Input.tsx', to: 'app/components/common/Input/Input.tsx' },
  { from: 'app/components/Themed.tsx', to: 'app/components/common/Themed/Themed.tsx' },
  
  // Components - Forms
  { from: 'app/components/CategoryPills.tsx', to: 'app/components/forms/CategoryPills/CategoryPills.tsx' },
  { from: 'app/components/EmojiPill.tsx', to: 'app/components/forms/EmojiPill/EmojiPill.tsx' },
  { from: 'app/components/TriggerPill.tsx', to: 'app/components/forms/TriggerPill/TriggerPill.tsx' },
  
  // Components - Layout
  { from: 'app/components/Header.tsx', to: 'app/components/layout/Header/Header.tsx' },
  
  // Strategy Components
  { from: 'app/components/StrategyCard.tsx', to: 'app/features/strategies/components/StrategyCard/StrategyCard.tsx' },
  { from: 'app/components/TriggerPatterns.tsx', to: 'app/features/strategies/components/TriggerPatterns/TriggerPatterns.tsx' },
  
  // Modals
  { from: 'app/screens/modals/modal.tsx', to: 'app/components/common/Modals/BaseModal/BaseModal.tsx' },
  { from: 'app/screens/modals/answer-selector-modal.tsx', to: 'app/components/common/Modals/AnswerSelectorModal/AnswerSelectorModal.tsx' },
  { from: 'app/screens/modals/approval-pending-modal.tsx', to: 'app/features/auth/components/ApprovalPendingModal/ApprovalPendingModal.tsx' },
  { from: 'app/screens/modals/duration-picker-modal.tsx', to: 'app/features/tracking/components/DurationPickerModal/DurationPickerModal.tsx' },
  { from: 'app/screens/modals/instance-details-modal.tsx', to: 'app/features/tracking/components/InstanceDetailsModal/InstanceDetailsModal.tsx' },
  { from: 'app/screens/modals/strategy-modal.tsx', to: 'app/features/strategies/components/StrategyModal/StrategyModal.tsx' },
  { from: 'app/screens/modals/time-picker-modal.tsx', to: 'app/features/tracking/components/TimePickerModal/TimePickerModal.tsx' },
  
  // Auth Feature
  { from: 'app/screens/auth/login.tsx', to: 'app/features/auth/screens/LoginScreen/LoginScreen.tsx' },
  { from: 'app/utils/tokenRefresher.ts', to: 'app/features/auth/utils/tokenRefresher.ts' },
  { from: 'app/utils/tokenUtils.ts', to: 'app/features/auth/utils/tokenUtils.ts' },
  
  // Tracking Feature
  { from: 'app/screens/tracking/form-sections/AwarenessTypeSection.tsx', to: 'app/features/tracking/components/FormSections/AwarenessTypeSection/AwarenessTypeSection.tsx' },
  { from: 'app/screens/tracking/form-sections/CategorySection.tsx', to: 'app/features/tracking/components/FormSections/CategorySection/CategorySection.tsx' },
  { from: 'app/screens/tracking/form-sections/NotesSection.tsx', to: 'app/features/tracking/components/FormSections/NotesSection/NotesSection.tsx' },
  { from: 'app/screens/tracking/form-sections/TimeAndDurationSection.tsx', to: 'app/features/tracking/components/FormSections/TimeAndDurationSection/TimeAndDurationSection.tsx' },
  { from: 'app/screens/tracking/form-sections/UrgeStrengthSection.tsx', to: 'app/features/tracking/components/FormSections/UrgeStrengthSection/UrgeStrengthSection.tsx' },
  { from: 'app/screens/tracking/history-screen.tsx', to: 'app/features/tracking/screens/HistoryScreen/HistoryScreen.tsx' },
  { from: 'app/screens/tracking/new-entry-screen.tsx', to: 'app/features/tracking/screens/NewEntryScreen/NewEntryScreen.tsx' },
  { from: 'app/screens/tracking/new-options-screen.tsx', to: 'app/features/tracking/screens/NewOptionsScreen/NewOptionsScreen.tsx' },
  { from: 'app/hooks/useEntryForm.ts', to: 'app/features/tracking/hooks/useEntryForm.ts' },
  
  // Strategies Feature
  { from: 'app/screens/tracking/new-strategy-screen.tsx', to: 'app/features/strategies/screens/NewStrategyScreen/NewStrategyScreen.tsx' },
  { from: 'app/screens/tracking/use-strategy-screen.tsx', to: 'app/features/strategies/screens/UseStrategyScreen/UseStrategyScreen.tsx' },
  
  // Settings Feature
  { from: 'app/screens/settings/settings-screen.tsx', to: 'app/features/settings/screens/SettingsScreen/SettingsScreen.tsx' },
  
  // Config
  { from: 'app/constants/config.ts', to: 'app/config/env.config.ts' },
  { from: 'app/constants/optionDictionaries.ts', to: 'app/constants/options.ts' },
  { from: 'app/constants/theme.ts', to: 'app/styles/theme.ts' },
  
  // Context
  { from: 'app/context/AuthContext.tsx', to: 'app/store/contexts/AuthContext.tsx' },
  { from: 'app/context/FormContext.tsx', to: 'app/store/contexts/FormContext.tsx' },
  
  // Services
  { from: 'app/services/api.ts', to: 'app/services/api/base.ts' },
  { from: 'app/services/strategies-api.ts', to: 'app/services/api/strategies.ts' },
  { from: 'app/services/ErrorService.ts', to: 'app/services/error/ErrorService.ts' },
  { from: 'app/utils/storage.ts', to: 'app/services/storage/StorageService.ts' },
  
  // Types
  { from: 'app/types/Instance.ts', to: 'app/types/instance.types.ts' },
  
  // Utils
  { from: 'app/utils/csvExport.ts', to: 'app/utils/export.utils.ts' },
  { from: 'app/utils/formUtils.ts', to: 'app/utils/form.utils.ts' },
  { from: 'app/utils/navigationUtils.ts', to: 'app/utils/navigation.utils.ts' },
];

// Create directories
const createDirectories = () => {
  const dirs = new Set();
  migrations.forEach(({ to }) => {
    const dir = path.dirname(to);
    dirs.add(dir);
  });
  
  Array.from(dirs).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Move files
const moveFiles = () => {
  migrations.forEach(({ from, to }) => {
    if (fs.existsSync(from)) {
      const toDir = path.dirname(to);
      if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir, { recursive: true });
      }
      fs.renameSync(from, to);
      console.log(`Moved: ${from} -> ${to}`);
    } else {
      console.warn(`Source file not found: ${from}`);
    }
  });
};

// Create index files
const createIndexFiles = () => {
  const indexFiles = [
    { path: 'app/components/common/AuthGuard/index.ts', content: 'export { default } from \'./AuthGuard\';\n' },
    { path: 'app/components/common/Button/index.ts', content: 'export { default } from \'./Button\';\n' },
    { path: 'app/components/common/Card/index.ts', content: 'export { default } from \'./Card\';\n' },
    { path: 'app/components/common/Input/index.ts', content: 'export { default } from \'./Input\';\n' },
    { path: 'app/components/common/Themed/index.ts', content: 'export * from \'./Themed\';\n' },
    { path: 'app/components/forms/CategoryPills/index.ts', content: 'export { default } from \'./CategoryPills\';\n' },
    { path: 'app/components/forms/EmojiPill/index.ts', content: 'export { default } from \'./EmojiPill\';\n' },
    { path: 'app/components/forms/TriggerPill/index.ts', content: 'export { default } from \'./TriggerPill\';\n' },
    { path: 'app/components/layout/Header/index.ts', content: 'export { default } from \'./Header\';\n' },
    // Add more index files as needed
  ];
  
  indexFiles.forEach(({ path, content }) => {
    fs.writeFileSync(path, content);
    console.log(`Created index file: ${path}`);
  });
};

// Execute migration
console.log('Starting file reorganization...');
createDirectories();
moveFiles();
createIndexFiles();
console.log('File reorganization complete!');
