# ZenTriviaApp - React Native Version

## Project Overview
A React Native mobile app featuring flip card trivia with zen-themed questions and smooth animations. This is the mobile version of the existing PWA trivia system.

## Current Status

### ✅ Completed
- **Project Structure**: Complete React Native app structure created
- **Components**: 
  - App.js (main entry point with navigation)
  - HomeScreen.js (zen-themed landing screen)
  - Card.js (animated flip card component with spring animations)
  - QuizScreen.js (quiz interface with navigation)
- **Data**: Sample zen trivia questions in JSON format
- **Styling**: Complete stylesheet with zen aesthetic
- **Dependencies**: Package.json configured with Expo 49.0.15

### 🔧 Technical Issues Encountered

#### WSL/Windows Environment Problems
- **Android SDK Path**: WSL cannot find Windows-installed Android SDK
- **ADB Bridge Issue**: WSL looks for `adb` but Windows has `adb.exe`
- **Web Version**: Blank screen at http://localhost:19006/ (React Native web compatibility)

#### Environment Setup
- **Android SDK Location**: `/mnt/c/Users/charl/AppData/Local/Android/Sdk`
- **Environment Variables Set**: ANDROID_HOME configured for WSL
- **Virtual Environment**: Currently using pwa-dev (should create separate rn-dev)

### 🚀 Working Solutions
1. **Expo Go App**: Install on Android phone, scan QR code from `npx expo start`
2. **APK Build**: `expo build:android` (requires Expo account)
3. **Linux Development**: Will work properly on native Linux machine

## Getting Started

### Prerequisites
- Node.js and npm installed
- Android Studio (for emulator) OR Android phone with Expo Go
- For WSL users: Android SDK path configuration required

### Installation
```bash
cd ZenTriviaApp
npm install
```

### Running the App

#### Method 1: Expo Go (Recommended for testing)
1. Install "Expo Go" app on Android phone
2. Run: `npx expo start`
3. Scan QR code with Expo Go app

#### Method 2: Android Emulator (Linux/macOS)
```bash
npx expo start --android
```

#### Method 3: Web Version (Limited functionality)
```bash
npx expo start --web
```
*Note: Currently shows blank screen - React Native web compatibility issue*

### Building APK
```bash
expo build:android
```
*Requires Expo account and takes 10-15 minutes*

## Project Structure
```
ZenTriviaApp/
├── App.js                    # Main entry point
├── package.json             # Dependencies and scripts
├── src/
│   ├── components/
│   │   ├── Card.js          # Animated flip card component
│   │   └── HomeScreen.js    # Landing screen
│   ├── screens/
│   │   └── QuizScreen.js    # Quiz interface
│   ├── data/
│   │   └── trivia.json      # Sample zen trivia data
│   └── styles/
│       └── styles.js        # Complete stylesheet
└── README.md               # This file
```

## Technologies Used
- **React Native**: 0.72.10
- **Expo**: ~49.0.15
- **React Native Reanimated**: ~3.3.0 (for card flip animations)
- **React Native Web**: ~0.19.6 (web compatibility)

## Known Issues

### Development Environment
- WSL/Windows Android SDK bridge problems
- Web version shows blank screen
- Virtual environment mixing (pwa-dev vs rn-dev)

### Solutions Planned
- **Tomorrow**: Switch to Linux development machine for proper Android development
- **Environment**: Create dedicated React Native virtual environment
- **Testing**: Use Expo Go app for immediate testing

## Next Steps

### Development Priority
1. **Environment Setup**: Linux machine with native Android SDK
2. **Testing**: Verify all components work on actual device
3. **Content Integration**: Connect to existing trivia data from PWA version
4. **Deployment**: Build and distribute APK

### Feature Roadmap
- [ ] Integration with existing PWA trivia data
- [ ] Multiple topic support
- [ ] Progress tracking
- [ ] Sound effects and haptic feedback
- [ ] Offline capability
- [ ] User preferences and settings

## Notes
- First React Native app attempt
- Part of larger boxiii trivia system
- Zen aesthetic maintained from PWA version
- Flip card animations are core feature

## Troubleshooting

### Blank Web Screen
- React Native web compatibility issue
- Use Expo Go app instead for testing

### Android SDK Not Found
- Windows/WSL bridge problem
- Set ANDROID_HOME environment variable
- Use Linux development environment for best results

### Server Hanging
- Press Ctrl+C to stop Expo development server
- Always ask before starting server commands