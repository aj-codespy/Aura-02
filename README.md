# ProjectAura - Smart Factory Energy Management System

A React Native mobile application for monitoring and controlling industrial IoT devices, built with Expo and TypeScript.

## Features

- 🏭 **Real-time Device Monitoring** - Track status, temperature, and energy consumption
- 📊 **Analytics Dashboard** - Visualize energy usage with charts and heatmaps
- ⏰ **Schedule Management** - Automate device control with time-based schedules
- 🔔 **Smart Alerts** - Get notified of critical device conditions
- 🌓 **Dark Mode** - Full theme support for day and night usage
- 🔄 **Background Sync** - Automatic data synchronization every 30 seconds

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app (for testing on physical devices)

## Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ProjectAura
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure AWS Amplify (Optional)**

   If using AWS Cognito for authentication:
   - Copy `src/constants/aws-exports.example.js` to `src/constants/aws-exports.js`
   - Update with your AWS Cognito credentials
   - **Important**: `aws-exports.js` is gitignored to protect credentials

4. **Update app identifiers**

   Edit `app.json` and replace:
   - `com.yourname.projectaura` with your bundle identifier
   - Update app name and slug if desired

## Running the App

### Development Mode

```bash
npm start
```

Then:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go for physical device

### Build for Production

```bash
# iOS
npm run ios

# Android
npm run android
```

## Project Structure

```
ProjectAura/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Main tab navigation
│   ├── (auth)/            # Authentication screens
│   ├── devices/           # Device management screens
│   └── settings/          # Settings screens
├── src/
│   ├── components/        # Reusable UI components
│   ├── database/          # SQLite database layer
│   ├── services/          # Business logic (sync, hardware API)
│   ├── theme/             # Design tokens and theming
│   └── utils/             # Helper functions
└── assets/                # Images and static files
```

## Configuration

### Hardware API

The app supports both mock and real hardware modes:

**Mock Mode** (Default for development):

- Edit `src/services/deviceSync.ts`
- Set `USE_MOCK = true`
- Generates simulated device data

**Real Hardware Mode**:

- Set `USE_MOCK = false`
- Configure server IPs in `DeviceSyncService.discoverDevices()`
- Ensure Local LAN API is accessible

### Database

- Uses SQLite for local data storage
- Automatically initializes on first launch
- Cleans up old data to prevent memory issues
- Tables: users, servers, nodes, schedules, energy_data, alerts

### Theme

- Light and Dark modes supported
- Theme preference persisted in AsyncStorage
- Toggle in Settings → Appearance

## Known Issues & Limitations

1. **Memory Management**: On Android devices with limited RAM, clear app data if experiencing OOM errors
2. **Mock Data**: Currently uses simulated data - connect to real hardware API for production
3. **Authentication**: AWS Cognito integration is placeholder - configure with real credentials
4. **API ID Mapping**: Node API IDs not yet stored in database (see TODO in `deviceSync.ts`)

## Troubleshooting

### App stuck on loading screen

- Clear app data: Settings → Apps → ProjectAura → Clear Data
- Or run: `adb shell pm clear com.yourname.projectaura`

### Database errors

- The app automatically drops and recreates tables on init during development
- For production, remove DROP TABLE statements in `src/database/index.ts`

### Out of Memory errors

- Reduce sync frequency in `src/services/deviceSync.ts`
- Clear app data to reset database
- Ensure you're using the latest code with memory optimizations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.
