# Armatillo Changelog

All notable changes to the Armatillo app (habit tracking for BFRBs with habit reversal training) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-03-03

### Added
- Project reinitialization with Expo Router (expo-router/entry as main entry point)
- TypeScript support with tsconfig.json
- Project structure based on Expo Router architecture:
  - `/app` directory (using expo-router file-based routing)
    - `_layout.tsx` - Main layout component
    - `+html.tsx` - HTML document structure
    - `+not-found.tsx` - 404 page
    - `modal.tsx` - Modal screen implementation
    - `/(tabs)` - Tab-based navigation structure
      - `_layout.tsx` - Tab navigation configuration
      - `index.tsx` - First tab screen
      - `two.tsx` - Second tab screen
  - `/components` - Reusable UI components
    - `EditScreenInfo.tsx` - Demo component with external links
    - `ExternalLink.tsx` - Component for external links
    - `StyledText.tsx` - Text styling component
    - `Themed.tsx` - Theme-aware components
    - `useColorScheme.ts` - Hook for color scheme detection
    - `useClientOnlyValue.ts` - Hook for client-only values
  - `/constants` - App-wide constants
    - `Colors.ts` - Color theme definitions
  - `/assets` - Static assets directory

### Dependencies
- React Native 0.76.7
- Expo 52.0.37
- Expo Router 4.0.17
- React 18.3.1
- TypeScript 5.3.3
- React Navigation
- Jest for testing

### Changed
- N/A (initial setup)

### Removed
- N/A (initial setup)
