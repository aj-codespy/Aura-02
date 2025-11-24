# Project Aura - Comprehensive Documentation

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Complete Feature List](#complete-feature-list)
3. [Core Services](#core-services)
4. [Database Schema](#database-schema)
5. [Module Breakdown](#module-breakdown)
6. [Unique & Advanced Features](#unique--advanced-features)

---

## 1. Architecture Overview

**"Cloud-Auth, Local-Op"** - A hybrid architecture optimized for reliability and privacy.

- **Authentication**: AWS Cognito (Cloud-based, secure)
- **Operations**: 100% local using SQLite + direct LAN communication
- **Offline First**: Fully functional without internet (except initial login)
- **Real-time**: Background sync every 60 seconds with automatic pause/resume
- **Privacy**: All device data stays on-device, never sent to cloud

---

## 2. Complete Feature List

### 🔐 Authentication & Onboarding
- ✅ AWS Cognito integration (Email/Password)
- ✅ JWT token management with secure storage
- ✅ Session persistence (auto-login)
- ✅ Logout with confirmation dialog

### 🏠 Dashboard (Home Screen)
- ✅ Real-time device count (Active/Total)
- ✅ Live energy consumption metrics
- ✅ Recent alerts summary (Critical/Warning)
- ✅ Quick action cards
- ✅ Auto-refresh every 5 seconds

### 📱 Device Management
- ✅ **Device Discovery**: Automatic network scanning for Aura servers
- ✅ **QR Code Pairing**: Camera-based device registration
- ✅ **Device List**: Grouped by category (HVAC, Lighting, Motors, IT, Other)
- ✅ **Optimistic UI**: Instant feedback with automatic rollback on failure
- ✅ **Device Control**: Toggle ON/OFF with loading states
- ✅ **Device Details**: 
  - Live metrics (Voltage, Current, Power)
  - Temperature monitoring
  - Device metadata (Type, Category, Firmware, MAC)
  - Real-time updates (2-second polling)

### ⚠️ Intelligent Alerting System
- ✅ **Tiered Alerts**:
  - **Critical**: >95°C temp, >15A current (Sound + Vibration + High Priority)
  - **Warning**: >80°C temp, voltage out of range (Silent notification)
- ✅ **Alert Deduplication**: Prevents spam for same issue
- ✅ **Alerts Tab**:
  - Badge count on tab bar
  - Sorted by date (newest first)
  - Color-coded (Red/Yellow)
  - Swipe to dismiss
  - "Mark All Read" bulk action
- ✅ **Server Offline Detection**: 3-strike rule before marking offline

### 📊 Analytics & Data Visualization
- ✅ **Time-Range Charts**: 1H / 24H / 7D views
- ✅ **Real Data Integration**: Pulls from `data_points` table
- ✅ **Performance Optimization**: Downsampling to ~100 points
- ✅ **Chart Types**:
  - Energy line chart (power consumption over time)
  - Category pie chart (consumption by device type)
  - Usage heatmap
- ✅ **Auto-Refresh**: Charts update every 5 seconds
- ✅ **Data Cleanup**: Auto-delete data older than 30 days

### 💾 Data Portability
- ✅ **CSV Export**: All tables (servers, nodes, alerts, data_points)
- ✅ **CSV Import**: Batch insert with validation
- ✅ **Backup Reminders**: 30-day reminder system
- ✅ **Share Integration**: Export via system share sheet

### ⚙️ Settings & Preferences
- ✅ **Appearance**:
  - Dark/Light theme toggle
  - Haptic feedback toggle
  - Persistent preferences (AsyncStorage)
- ✅ **Server Management**:
  - List all servers with status
  - Force network re-scan
  - Delete individual servers
- ✅ **Advanced Tools**:
  - "Clear All Data" with confirmation
  - Database reset functionality
- ✅ **Account**: Logout with confirmation

### 🔔 Notifications
- ✅ **Permission Handling**: Graceful requests with "Open Settings" prompts
- ✅ **Local Push Notifications**: Critical alerts and warnings
- ✅ **Notification Channels**: Separate channels for critical/warning (Android)
- ✅ **Tap to Navigate**: Opens Alerts tab when notification is tapped

### 🌐 Network & Connectivity
- ✅ **Wi-Fi Detection**: Shows banner when on cellular (LTE/5G)
- ✅ **Network Banner**: "Local control requires Wi-Fi" warning
- ✅ **Automatic Discovery**: Subnet scanning using `expo-network`
- ✅ **Connection Resilience**: Graceful degradation on network loss

### 🔋 Battery & Performance
- ✅ **App Lifecycle Management**:
  - Pause sync when backgrounded
  - Resume sync when foregrounded
  - AppState listener for automatic control
- ✅ **Optimized Polling**: 60-second sync interval (configurable)
- ✅ **Efficient Queries**: Indexed database for fast reads

### 🛡️ Permissions & Privacy
- ✅ **Unified Permission Manager**:
  - Camera (QR scanning)
  - Notifications (Alerts)
  - Local Network (iOS)
- ✅ **User-Friendly Errors**: Clear messages with "Open Settings" option
- ✅ **Permission Status Checking**: Avoid repeated requests

---

## 3. Core Services

### 🧠 DeviceSyncService (`src/services/deviceSync.ts`)
**The "Brain" - Orchestrates all synchronization**

**Key Methods**:
- `syncAll()`: Main sync loop (servers → nodes → metrics → alerts)
- `discoverDevices()`: Network scanning for Aura servers
- `toggleNode()`: Device control with optimistic UI support
- `pause()` / `resume()`: App lifecycle management
- `startBackgroundSync()` / `stopBackgroundSync()`: Interval control

**Intelligence**:
- 3-strike offline detection
- Tiered temperature monitoring (>80°C warning, >95°C critical)
- Voltage range checking (<180V or >250V)
- Current limit monitoring (>15A)
- Alert deduplication

### 🛠️ HardwareService (`src/services/hardware.ts`)
**The "Hands" - Direct hardware communication**

**API Endpoints**:
- `GET /api/v1/status` - Server health check
- `GET /api/v1/nodes` - Fetch linked devices
- `PUT /api/v1/nodes/{id}/state` - Toggle device
- `GET /api/v1/history` - Bulk data retrieval
- `POST /api/v1/nodes` - Register new device

### 💾 Repository (`src/database/repository.ts`)
**The "Memory" - Data access layer**

**Key Methods**:
- **Servers**: `upsertServer`, `getServers`
- **Nodes**: `upsertNode`, `getAllNodes`, `getNodesByCategory`
- **Alerts**: `createAlert`, `getUnreadAlerts`, `markAlertRead`
- **Data Points**: `logDataPoint`, `getAggregatedDataPoints`, `deleteOldDataPoints`
- **Analytics**: `getDataPointsForNode` (time-range queries)

### 🔔 NotificationService (`src/services/notifications.ts`)
**The "Voice" - User notifications**

**Features**:
- Permission management
- Android notification channels (Critical/Warning)
- Sound + vibration for critical alerts
- Silent notifications for warnings
- Tap-to-navigate integration

### 🎨 ThemeContext (`src/context/ThemeContext.tsx`)
**Theme Management**

- Light/Dark mode toggle
- Persistent preferences (AsyncStorage)
- System theme detection
- Global color scheme

---

## 4. Database Schema

### `users`
```sql
id, cognito_id, email, full_name, preferences_json
```

### `servers`
```sql
id, name, local_ip_address, status (online/offline), last_seen
```

### `nodes` (Devices)
```sql
id, server_id, name, type (FAN/LIGHT/MOTOR/etc), 
category, status (on/off), state, temperature, voltage, current
```

### `data_points` (Energy History)
```sql
id, node_id, voltage, current, power_consumption, timestamp
```
**Indexed on**: `node_id`, `timestamp` for fast queries

### `alerts`
```sql
id, device_id, level (info/warning/critical), 
message, created_at, acknowledged (0/1)
```

### `schedules`
```sql
id, node_id, action, time, days, is_active
```

---

## 5. Module Breakdown

### 📱 App Screens (`app/`)

#### `(tabs)/index.tsx` - Dashboard
- Summary cards (devices, energy, alerts)
- Quick actions
- Real-time updates

#### `(tabs)/devices.tsx` - Device List
- Grouped by category
- Optimistic toggle
- Pull-to-refresh
- Loading states

#### `devices/[id].tsx` - Device Details
- Live metrics (V, A, W)
- Temperature gauge
- Metadata display
- Real-time polling (2s)

#### `(tabs)/alerts.tsx` - Alerts
- Badge count
- Color-coded list
- Dismiss functionality
- "Mark All Read"

#### `(tabs)/analytics.tsx` - Analytics
- Energy line chart
- Category pie chart
- Usage heatmap
- Time-range selector

#### `(tabs)/schedule.tsx` - Scheduling
- Custom SQLite implementation
- Time-based triggers
- Recurring schedules

#### `settings/*` - Settings Suite
- `index.tsx`: Main menu
- `appearance.tsx`: Theme + Haptics
- `servers.tsx`: Server management
- `advanced.tsx`: Database tools
- `data-export.tsx`: CSV export/import

---

## 6. Unique & Advanced Features

### 🌟 Features That Set This App Apart

#### 1. **Intelligent 3-Strike Offline Detection**
Most apps mark devices offline after a single failure. Aura uses a 3-strike system to avoid false positives from temporary network hiccups.

#### 2. **Tiered Alert System**
- **Critical**: Immediate action required (>95°C, >15A)
- **Warning**: Monitor situation (>80°C, voltage out of range)
- Different notification behaviors (sound vs silent)

#### 3. **Optimistic UI with Automatic Rollback**
Device toggles update instantly in the UI. If the API call fails, the UI automatically reverts to the previous state with an error message.

#### 4. **Smart Data Downsampling**
Charts can handle 10,000+ data points by automatically averaging them into ~100 buckets for smooth rendering.

#### 5. **App Lifecycle Battery Optimization**
Automatically pauses background sync when app is backgrounded, saving battery without user intervention.

#### 6. **Network-Aware Banner**
Proactively warns users when on cellular data, preventing confusion about why local control isn't working.

#### 7. **Unified Permission Manager**
Single source of truth for all permissions with user-friendly error messages and direct "Open Settings" links.

#### 8. **Alert Deduplication**
Prevents notification spam by checking for existing unread alerts with the same message before creating new ones.

#### 9. **Automatic Data Cleanup**
Keeps database lean by auto-deleting data points older than 30 days (runs every 10 sync cycles).

#### 10. **Offline-First Architecture**
100% functional without internet after initial login. All operations happen locally via LAN.

---

## 7. Project Structure

```
ProjectAura/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard
│   │   ├── devices.tsx         # Device List
│   │   ├── alerts.tsx          # Alerts
│   │   ├── analytics.tsx       # Charts
│   │   └── schedule.tsx        # Scheduling
│   ├── devices/
│   │   ├── add.tsx             # QR Scanner
│   │   └── [id].tsx            # Device Details
│   ├── settings/
│   │   ├── index.tsx           # Settings Menu
│   │   ├── appearance.tsx      # Theme + Haptics
│   │   ├── servers.tsx         # Server Management
│   │   ├── advanced.tsx        # Database Tools
│   │   └── data-export.tsx     # CSV Export/Import
│   └── _layout.tsx             # Root Layout (NetworkBanner + AppState)
├── src/
│   ├── components/
│   │   ├── analytics/          # Chart Components
│   │   └── ui/
│   │       └── NetworkBanner.tsx
│   ├── context/
│   │   └── ThemeContext.tsx    # Theme Management
│   ├── database/
│   │   ├── index.ts            # Schema & Init
│   │   └── repository.ts       # Data Access Layer
│   ├── services/
│   │   ├── deviceSync.ts       # Sync Logic + Rules Engine
│   │   ├── hardware.ts         # API Client
│   │   ├── notifications.ts    # Push Notifications
│   │   ├── auth.ts             # AWS Cognito
│   │   └── dataExport.ts       # CSV Logic
│   ├── utils/
│   │   ├── haptics.ts          # Haptic Feedback
│   │   └── permissions.ts      # Permission Manager
│   └── theme/
│       └── index.ts            # Colors, Typography, Layout
└── docs/
    └── project_structure.md    # This file
```

---

## 8. Technology Stack

- **Framework**: React Native (Expo)
- **Navigation**: Expo Router (file-based)
- **Database**: SQLite (`expo-sqlite`)
- **Auth**: AWS Cognito (Amplify)
- **Charts**: `react-native-gifted-charts`
- **Notifications**: `expo-notifications`
- **Network**: `expo-network`
- **Camera**: `expo-camera`
- **Storage**: AsyncStorage (preferences)
- **State**: React Hooks (local state)
- **Styling**: StyleSheet API (no external CSS libraries)

---

## 9. Key Metrics

- **Database Tables**: 6 (users, servers, nodes, data_points, alerts, schedules)
- **API Endpoints**: 10+ (status, nodes, state, history, etc.)
- **Screens**: 15+ (tabs, settings, device details, etc.)
- **Services**: 6 core services
- **Background Tasks**: 1 (60-second sync with pause/resume)
- **Notification Channels**: 2 (Critical, Warning)
- **Chart Types**: 3 (Line, Pie, Heatmap)
- **Time Ranges**: 3 (1H, 24H, 7D)
- **Permission Types**: 3 (Camera, Notifications, Local Network)

---

**Last Updated**: 2025-11-24  
**Version**: 1.0.0  
**Status**: Production Ready
