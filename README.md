# Armatillo Mobile App

A React Native mobile application for tracking and managing Body-Focused Repetitive Behaviors (BFRBs) using habit reversal training techniques.

## About

Armatillo is designed to help users track, manage, and reduce Body-Focused Repetitive Behaviors (BFRBs) through habit reversal training. The app provides tools for monitoring behavior instances, implementing competing responses, and creating personalized strategies.

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - React Native development platform
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **Async Storage** - Local data persistence
- **Reanimated** - Animations library
- **Secure Store** - Secure data storage

## Features

- User authentication (email/password and Google OAuth)
- BFRB instance tracking with customizable triggers
- Strategy management for habit reversal training
- Competing response planning and tracking
- Community support network management
- Push notifications and reminders
- Offline support with data syncing
- Comprehensive analytics and progress tracking

## Project Structure

```
app/
  ├── (tabs)/           # Tab-based navigation screens
  ├── components/       # Reusable UI components
  ├── constants/        # App constants and configuration
  ├── context/          # React context providers
  ├── hooks/            # Custom React hooks
  ├── screens/          # Screen components
  ├── services/         # API and service integrations
  │   ├── api.ts        # Base API request handler
  │   └── strategies-api.ts # Strategies API integration
  ├── types/            # TypeScript type definitions
  ├── utils/            # Utility functions
  └── _layout.tsx       # Root layout component
```

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ambrosia-fish/armatillo-app.git
   cd armatillo-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment configuration:
   - Create a `.env` file with necessary configuration (see `.env.example` if available)
   - Configure your Expo development environment

4. Start the development server:
   ```bash
   npm start
   ```

5. Run on a specific platform:
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## API Integration

The app integrates with the [Armatillo API](https://github.com/ambrosia-fish/armatillo-api) for data persistence and user management. Key API features include:

- User authentication and account management
- BFRB instance storage and retrieval
- Strategy management endpoints
- Data synchronization

## Data Models

### Strategy Model

Strategies are the core component of habit reversal training in the app, containing:

- Trigger identification
- Competing responses
- Stimulus controls
- Community supports
- Notifications and reminders

### Instance Model

Instances track occurrences of BFRBs with detailed context:

- Time and duration
- Environmental factors
- Emotional states
- Thoughts and sensations
- Urge intensity
- Behavioral intention (automatic vs. intentional)

## Testing

Run tests with:
```bash
npm test
```

## License

0BSD

## Development Status

This application is currently in active development (pre-alpha stage).

For more information or to become a tester, contact: josef@feztech.io