# Acme Mobile App

A modern Expo 53 React Native application with NativeWind v4, Gluestack UI components, and TypeScript. Built for cross-platform mobile development.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Simulator** (macOS) or **Android Emulator**
- **Expo Go** app on your device (optional)

### Development

```bash
# Start development server
pnpm dev

# Or from root directory
pnpm dev --filter=mobile
```

### Platform-Specific Development

```bash
# iOS Simulator (macOS only)
pnpm dev --filter=mobile -- --ios

# Android Emulator
pnpm dev --filter=mobile -- --android

# Web Browser
pnpm dev --filter=mobile -- --web
```

## 🛠️ Tech Stack

- **Framework**: Expo 53 with React Native
- **Language**: TypeScript
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **UI Components**: Gluestack UI (Universal component library)
- **Navigation**: Expo Router (file-based routing)
- **Package Manager**: pnpm
- **Build Tool**: Metro bundler

## 📁 Project Structure

```
apps/mobile/
├── app/                    # File-based routing pages
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home page
│   └── (tabs)/            # Tab navigation
├── components/            # Mobile-specific components
│   └── ui/               # Gluestack UI components
├── assets/               # Images, fonts, and static assets
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # NativeWind configuration
├── app.json              # Expo configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Styling

### NativeWind v4

This project uses NativeWind v4, which brings Tailwind CSS to React Native:

```tsx
import { View, Text } from 'react-native'

export default function Component() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-gray-900">
        Welcome to Acme
      </Text>
    </View>
  )
}
```

### Gluestack UI Components

Universal UI components that work across platforms:

```tsx
import { Button, ButtonText } from '@gluestack-ui/button'
import { Card, CardHeader, CardBody } from '@gluestack-ui/card'

export default function Component() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Text className="text-lg font-semibold">Welcome</Text>
      </CardHeader>
      <CardBody>
        <Button>
          <ButtonText>Get Started</ButtonText>
        </Button>
      </CardBody>
    </Card>
  )
}
```

## 🔧 Configuration

### Expo Configuration

```json
// app.json
{
  "expo": {
    "name": "acme",
    "slug": "acme-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

### NativeWind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

## 📦 Dependencies

### Core Dependencies

- **Expo 53**: React Native development platform
- **React Native**: Mobile app framework
- **TypeScript**: Type-safe development
- **NativeWind v4**: Tailwind CSS for React Native

### UI Dependencies

- **Gluestack UI**: Universal component library
- **Expo Vector Icons**: Icon library
- **React Navigation**: Navigation library
- **Expo Router**: File-based routing

### Development Dependencies

- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Babel**: JavaScript compiler

## 🚀 Development Workflow

### Adding New Pages

1. Create a new file in the `app` directory
2. Export a default React component
3. The file path becomes the route

```tsx
// app/profile.tsx
import { View, Text } from 'react-native'

export default function ProfilePage() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">Profile</Text>
    </View>
  )
}
```

### Adding Gluestack UI Components

```bash
# Add new components
pnpm ui:add button
pnpm ui:add card
pnpm ui:add input
```

### Using Shared UI Components

```tsx
import { Button } from '@acme/ui/components/button'
import { Card } from '@acme/ui/components/card'

// Use shared components from the monorepo
```

### Navigation with Expo Router

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
    </Stack>
  )
}
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm start` | Start Expo development server |
| `pnpm android` | Start Android emulator |
| `pnpm ios` | Start iOS simulator |
| `pnpm web` | Start web development |
| `pnpm lint` | Run ESLint |
| `pnpm reset-project` | Reset to blank project |

## 🌐 Environment Variables

Create a `.env` file for environment variables:

```bash
# .env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_APP_NAME=Acme
```

## 🚀 Deployment

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for production
eas build --platform all
```

### Expo Publish (Legacy)

```bash
# Publish to Expo
expo publish
```

### App Store Deployment

```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Google Play Store Deployment

```bash
# Build for Google Play
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

## 📱 Platform Support

### iOS
- **Minimum Version**: iOS 13.0
- **Target Version**: iOS 17.0
- **Devices**: iPhone, iPad

### Android
- **Minimum Version**: Android 5.0 (API 21)
- **Target Version**: Android 14 (API 34)
- **Devices**: Phone, Tablet

### Web
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Features**: Responsive design, PWA support

## 🔍 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
# Clear Metro cache
pnpm dev --filter=mobile -- --clear
```

**iOS Simulator not starting:**
```bash
# Reset iOS Simulator
xcrun simctl erase all
```

**Android Emulator issues:**
```bash
# Reset Android Emulator
emulator -avd <avd_name> -wipe-data
```

**Expo Go connection issues:**
```bash
# Use tunnel connection
pnpm dev --filter=mobile -- --tunnel
```

### Performance Optimization

```tsx
// Use React.memo for expensive components
import React from 'react'

const ExpensiveComponent = React.memo(({ data }) => {
  return <View>{/* Component content */}</View>
})

// Use useMemo for expensive calculations
import { useMemo } from 'react'

const Component = ({ items }) => {
  const processedItems = useMemo(() => {
    return items.map(item => ({ ...item, processed: true }))
  }, [items])
  
  return <View>{/* Use processedItems */}</View>
}
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Gluestack UI Documentation](https://ui.gluestack.io/)
- [Expo Router Documentation](https://docs.expo.dev/router/)

## 🤝 Contributing

1. Follow the monorepo development workflow
2. Test on multiple platforms (iOS, Android, Web)
3. Ensure all tests pass
4. Follow the established code style
5. Update documentation as needed

## 📱 Testing

### Manual Testing

```bash
# Test on iOS Simulator
pnpm dev --filter=mobile -- --ios

# Test on Android Emulator
pnpm dev --filter=mobile -- --android

# Test on Web
pnpm dev --filter=mobile -- --web
```

### Automated Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test --coverage
```

---

Built with ❤️ using Expo 53, NativeWind v4, and Gluestack UI
