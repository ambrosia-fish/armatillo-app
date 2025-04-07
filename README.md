# Armatillo - BFRB Habit Reversal Tracker

Armatillo is a cross-platform mobile application designed to help individuals track Body-Focused Repetitive Behaviors (BFRBs) during habit reversal training. Built with React Native and Expo, Armatillo offers a user-friendly interface for tracking behavioral patterns, triggers, and progress over time.

## 📱 Features

- **BFRB Instance Tracking**: Record detailed information about behavior instances including:
  - Time and duration of episodes
  - Urge strength assessments
  - Intentional vs. automatic behaviors
  - Environmental factors and triggers
  - Emotional and cognitive states
  - Physical sensations and locations

- **Authentication System**:
  - Email/password login
  - Secure token-based authentication
  - Token refresh mechanism

- **Cross-Platform Support**:
  - iOS
  - Android
  - Web (PWA)

- **Progress Visualization**:
  - Track behavior frequency over time
  - Identify patterns and triggers

## 🛠️ Technology Stack

- **React Native**: Core UI framework
- **Expo**: Development platform and toolchain
- **Expo Router**: Navigation and routing
- **TypeScript**: Type-safe code
- **AsyncStorage**: Local data persistence
- **Fetch API**: RESTful HTTP client
- **Context API**: State management

## 🏗️ Project Structure

```
armatillo-app/
├── app/                        # Main application code
│   ├── (tabs)/                 # Tab-based navigation screens
│   │   ├── _layout.tsx         # Tab navigation configuration
│   │   ├── index.tsx           # Home tab screen
│   │   ├── progress.tsx        # Progress visualization tab
│   │   └── settings.tsx        # Settings tab
│   ├── components/             # Reusable UI components
│   │   ├── AuthGuard.tsx       # Authentication protection
│   │   ├── Button.tsx          # Custom button component
│   │   ├── Card.tsx            # Card UI component
│   │   ├── Header.tsx          # App header component
│   │   └── ...
│   ├── constants/              # Application constants
│   │   ├── config.ts           # Environment configuration
│   │   ├── optionDictionaries.ts # Data dictionaries
│   │   └── theme.ts            # UI theme definitions
│   ├── context/                # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── FormContext.tsx     # Form data management
│   ├── hooks/                  # Custom React hooks
│   │   ├── useColorScheme.ts   # Theme detection hook
│   │   └── useError.ts         # Error handling hook
│   ├── screens/                # Application screens
│   │   ├── auth/               # Authentication screens
│   │   ├── modals/             # Modal screens
│   │   └── tracking/           # BFRB tracking flow screens
│   ├── services/               # API and service integrations
│   │   ├── ErrorService.ts     # Error handling service
│   │   └── api.ts              # API client
│   ├── types/                  # TypeScript type definitions
│   │   └── Instance.ts         # BFRB instance data model
│   ├── utils/                  # Utility functions
│   │   ├── csvExport.ts        # Data export functionality
│   │   ├── storage.ts          # Local storage utilities
│   │   ├── tokenRefresher.ts   # Authentication token refresh
│   │   └── tokenUtils.ts       # JWT token management
│   ├── _layout.tsx             # Root navigation layout
│   └── index.tsx               # Application entry point
├── assets/                     # Static assets
│   ├── fonts/                  # Custom fonts
│   └── images/                 # Image assets
└── public/                     # Web public assets
    └── manifest.json           # PWA manifest
```

## 🔄 Data Flow

1. **Authentication**:
   - User credentials validated through RESTful API
   - JWT tokens stored securely
   - Auto-refresh mechanism keeps sessions alive

2. **BFRB Tracking**:
   - Data captured through multi-step form process
   - FormContext maintains state during tracking flow
   - Validated data sent to backend API

3. **Persistence**:
   - Instance data stored on backend server
   - Cached locally for offline access when needed
   - Data synchronization when connectivity restored

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ambrosia-fish/armatillo-app.git
   cd armatillo-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a local .env file with the following variables:
   ```
   # API Configuration
   API_URL=http://localhost:3000
   API_BASE_PATH=/api
   ```

### Running the App

- **iOS Simulator**:
  ```bash
  npm run ios
  ```

- **Android Emulator**:
  ```bash
  npm run android
  ```

- **Web Development**:
  ```bash
  npm run web
  ```

## 🌐 Environment Configuration

The app can run in three different environments:

- **Development**: Local development with Expo Go or native builds
- **Staging**: Testing environment with staging API
- **Production**: Production environment with live API

Environment settings are managed in `app/constants/config.ts`.

## ✅ Testing

Run the test suite with:

```bash
npm test
```

## 🏗️ Building for Production

### iOS/Android

```bash
expo build:ios  # For iOS
expo build:android  # For Android
```

### Web

```bash
expo build:web
```

## 📚 Related Repositories

- [armatillo-api](https://github.com/ambrosia-fish/armatillo-api) - Backend API for the Armatillo app

## 📄 License

This project is licensed under the ISC License.
