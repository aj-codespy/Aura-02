# Project Aura - Project Structure & Logic Documentation

## 1. Architecture Overview

**"Cloud-Auth, Local-Op"**

- **Authentication**: Managed via AWS Cognito (Cloud).
- **Operations**: All device control, logic, and data storage happen locally on the device using SQLite and direct LAN communication.
- **Offline First**: The app is fully functional without internet access (except for initial login).

## 2. Core Logic & Services (`src/services`)

### 🧠 DeviceSyncService (`src/services/deviceSync.ts`)

**The "Brain" of the operation.**

- **Responsibility**: Orchestrates synchronization between the local app and physical IoT devices.
- **Key Methods**:
  - `syncAll()`: Iterates through known servers, checks status, fetches nodes, and updates the local database.
  - **Alert Logic**: Detects "Server Offline" and "Overheating" conditions during sync and triggers alerts.
  - **Background Sync**: Runs every 60 seconds to keep data fresh.

### 🛠️ HardwareService (`src/services/hardware.ts`)

**The "Hands" of the operation.**

- **Responsibility**: Direct HTTP communication with IoT devices (ESP32/Raspberry Pi).
- **Key Methods**:
  - `getServerStatus(ip)`: Checks if a server is online.
  - `getLinkedNodes(ip)`: Fetches devices attached to a server.
  - `setNodeState(ip, nodeId, state)`: Toggles devices ON/OFF.
  - `pairDevice(qrData)`: Simulates or performs device pairing.

### 💾 Repository (`src/database/repository.ts`)

**The "Memory" of the operation.**

- **Responsibility**: Abstraction layer for SQLite database operations.
- **Key Methods**: `upsertNode`, `createAlert`, `logDataPoint`, `getAllNodes`.
- **Database**: `aura.db` (Managed via `expo-sqlite`).

### 🔔 NotificationService (`src/services/notifications.ts`)

**The "Voice" of the operation.**

- **Responsibility**: Sends local push notifications.
- **Triggers**: Critical alerts (Overheating, Server Offline) and Status Changes.

---

## 3. Database Schema (`src/database/index.ts`)

### `users`

- `id`, `cognito_id`, `email`, `full_name`, `preferences_json`

### `servers`

- `id`, `name`, `local_ip_address`, `status` (online/offline), `last_seen`

### `nodes` (Devices)

- `id`, `server_id`, `name`, `type` (FAN, LIGHT, etc.), `category`, `status` (on/off), `state`, `temperature`, `voltage`, `current`

### `data_points` (Energy/History)

- `id`, `node_id`, `voltage`, `current`, `power_consumption`, `timestamp`

### `alerts`

- `id`, `device_id`, `level` (info/warning/critical), `message`, `created_at`, `acknowledged` (0/1)

### `schedules` (Main DB)

- `id`, `node_id`, `action`, `time`, `days`, `is_active`
- _Note: The Schedule Screen currently uses a separate local DB (`iot_local_config.db`)._

---

## 4. Pages & Logic (`app/`)

### 🏠 Dashboard (`app/(tabs)/index.tsx`)

- **Logic**: Displays high-level summary (Active Devices, Energy Usage, Recent Alerts).
- **Connections**: Fetches data from `Repository`.

### 📱 Devices (`app/(tabs)/devices.tsx`)

- **Logic**: Lists all devices grouped by category. Allows toggling ON/OFF.
- **Connections**:
  - `Repository.getAllNodes()` to list.
  - `HardwareService.setNodeState()` to control.
  - `DeviceSyncService.syncAll()` to refresh.

### ⚠️ Alerts (`app/(tabs)/alerts.tsx`)

- **Logic**: Lists critical and warning alerts. Allows dismissing (acknowledging) alerts.
- **Connections**: `Repository.getUnreadAlerts()`, `Repository.markAlertRead()`.

### 📅 Schedule (`app/(tabs)/schedule.tsx`)

- **Logic**: Full CRUD for scheduling tasks (Time, Day, Action).
- **Special Note**: Uses a **self-contained SQLite helper class (`ScheduleDB`)** interacting with `iot_local_config.db`. This is distinct from the main `Repository`.

### ➕ Add Device (`app/devices/add.tsx`)

- **Logic**: QR Code Scanner using `expo-camera`.
- **Connections**: `HardwareService.pairDevice()`.

### ⚙️ Settings (`app/settings/*`)

- **Data Export (`data-export.tsx`)**:
  - Uses `DataExportService` to generate CSVs of all tables.
  - Handles Backup Reminders (30-day logic).
- **Profile (`profile.tsx`)**: User details from `Repository.getUser()`.

---

## 5. Project Tree (Key Files)

```
ProjectAura/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx       # Dashboard
│   │   ├── devices.tsx     # Device List
│   │   ├── alerts.tsx      # Alerts List
│   │   └── schedule.tsx    # Schedule Manager (Custom DB)
│   ├── devices/
│   │   └── add.tsx         # QR Scanner
│   └── settings/
│       └── data-export.tsx # CSV Export/Import
├── src/
│   ├── database/
│   │   ├── index.ts        # DB Init & Schema
│   │   └── repository.ts   # Data Access Layer
│   └── services/
│       ├── deviceSync.ts   # Sync Logic & Rules Engine
│       ├── hardware.ts     # API Client
│       ├── notifications.ts# Push Notifications
│       └── dataExport.ts   # CSV Logic
└── docs/
    └── project_structure.md # This file
```
