# App Implementation Details

This document provides a comprehensive technical overview of the Project Aura application. It covers the architecture, database schema, API contracts, synchronization logic, and key services. It is intended for developers who need to understand the internal workings of the app for maintenance or future development.

## 1. Architecture Overview

**Philosophy:** "Cloud-Auth, Local-Op" (Cloud Authentication, Local Operation).
The application is designed to function primarily on the local network (LAN) for interacting with IoT devices, ensuring low latency and offline capability. However, it leverages the cloud for user authentication and potential remote backups/analytics.

**Core Stack:**

- **Framework:** React Native with Expo (Managed Workflow)
- **Routing:** `expo-router` (File-based routing)
- **Local Database:** `expo-sqlite` (SQLite)
- **Authentication:** AWS Amplify (Cognito) - _Currently Mocked_
- **Styling:** Custom Design System (Vanilla CSS-in-JS + Themed components)

---

## 2. Database Schema (SQLite)

The local SQLite database is the single source of truth for the application state. It caches server configurations, node states, and historical data points.

**File:** `src/database/index.ts` & `src/database/repository.ts`

### Tables

1.  **`users`**
    - Stores user profile and preferences.
    - Columns: `id`, `cognito_id`, `email`, `full_name`, `preferences_json`

2.  **`servers`**
    - Represents physical IoT controllers/servers discovered on the network.
    - Columns: `id`, `name`, `local_ip_address`, `status` ('online'/'offline'), `last_seen`

3.  **`nodes`**
    - Represents individual devices (actuators/sensors) connected to a Server.
    - Columns: `id`, `server_id` (FK), `name`, `type`, `category`, `status` ('on'/'off'/'offline'), `state`, `temperature`, `voltage`, `current`

4.  **`data_points`** (formerly `energy_data`)
    - High-frequency time-series data for analysis.
    - Columns: `id`, `node_id` (FK), `voltage`, `current`, `power_consumption`, `timestamp`

5.  **`schedules`**
    - Local mirror of schedule tasks.
    - Columns: `id`, `device_id` (FK), `title`, `action`, `time`, `days_json`, `date`, `enabled`

6.  **`alerts`**
    - System alerts and notifications history.
    - Columns: `id`, `device_id` (FK), `level` ('info'/'warning'/'critical'), `message`, `created_at`, `acknowledged`

### Initialization & Migrations

- The database executes a series of `CREATE TABLE IF NOT EXISTS` commands on startup.
- **Migrations:** Handled manually in `initDatabase` by checking for missing columns and executing `ALTER TABLE` statements (e.g., adding `device_id` to `alerts` or `local_ip_address` to `servers`).
- **Cleanup:** On startup, the app deletes `data_points` older than the last 100 entries and alerts older than the last 50 to maximize performance on mobile devices.

### How it is Implemented in Code

- **Singleton Pattern:** The database instance is exported as a singleton from `index.ts`.
- **Repository Layer:** We do NOT access `db.runAsync` directly in UI components. Instead, we use `Repository.ts` which acts as an abstraction layer (DAO pattern).
- **Async/Await:** All DB operations are asynchronous.
- **Usage Example:**

  ```typescript
  // Bad: Direct SQL in Component
  // db.runAsync('SELECT ...')

  // Good: Using Repository
  const servers = await Repository.getServers();
  ```

---

## 3. Hardware Communication (API Contract)

The app communicates with IoT servers over HTTP on the local network. The `HardwareService` encapsulates these interactions.

**File:** `src/services/hardware.ts`

### API Endpoints

All requests are standard HTTP fetch requests.

- `GET  /api/v1/status`: Heartbeat to check if server is online. Returns firmware version and uptime.
- `PUT  /api/v1/config`: Update server name.
- `POST /api/v1/nodes/register`: Pair a new device using a token.
- `GET  /api/v1/nodes`: Get list of all nodes connected to this server.
- `PUT  /api/v1/nodes/:id/state`: Control a device (Body: `{ state: 'on' | 'off' }`).
- `GET  /api/v1/schedules`: Fetch schedules stored on the hardware.
- `POST /api/v1/schedules`: Create a new schedule.
- `GET  /api/v1/sync`: **Critical.** Fetches buffered data points (voltage/current/temp) since a given `latestTimestamp`.
- `DELETE /api/v1/sync`: **Critical.** Acknowledges data receipt, telling the server it can clear its buffer up to a timestamp.

**Mock Mode:** The app supports a "Mock Mode" (toggled via `.env` or in `deviceSync.ts`), returning simulated data instead of making network requests.

### How it is Implemented in Code

- **Service Object:** `HardwareService` contains static async methods for each API endpoint.
- **AbortController:** A `fetchWithTimeout` helper wraps standard `fetch` with an `AbortController` to strictly enforce 2000ms timeouts. This is critical for scanning LANs where many IPs will be unreachable.
- **Error Handling:** All network errors typically throw an Error, which must be caught by the caller (usually `DeviceSyncService`).

---

## 4. Device Synchronization Logic

This is the brain of the "Local-Op" architecture, handling discovery, state consistency, and alerts.

**File:** `src/services/deviceSync.ts`

### Discovery

- **Logic:** Scans the local subnet (e.g., `192.168.1.x`) by iterating through IPs 1-254.
- **Mechanism:** Sends a fast-timeout (500ms) request to `/api/v1/status`. If a response is received, the IP is added to the `servers` table.
- **Batching:** Scans are done in batches (e.g., 20 IPs at a time) to avoid flooding the network stack.

### Synchronization (`syncAll`)

1.  **Iterate Servers:** Loops through all known servers in the DB.
2.  **Status Check:** Pings server. If unreachable after 3 consecutive failures, marks as `offline` and raises a critical alert.
3.  **Update Server Info:** Updates name and online status.
4.  **Fetch Nodes:** Retrieval of current structure (new nodes added, old removed).
5.  **State Sync:** Updates the local states (on/off, temperature) in the `nodes` table.
6.  **Data Ingestion:** Calls `/api/v1/sync` to pull new telemetry data, saves it to `data_points`, and then ACKS the receipt.
7.  **Alerting:** Runs local logic on new telemetry:
    - **Temp:** Warning > 80°C, Critical > 95°C.
    - **Voltage:** Warning < 180V or > 250V.
    - **Current:** Critical > 15A.
    - **Action:** Creates an Alert record and triggers a Notification.

### Background Sync

- Runs `syncAll()` every 60 seconds when the app is in the foreground.
- Paused when the app goes to background (handled in `_layout.tsx` via `AppState` listener).

### How it is Implemented in Code

- **State Machine:** `isSyncing` boolean prevents overlapping sync cycles.
- **Failure Tracking:** A `consecutiveFailures` Map tracks how many times a server has failed to respond, acting as a debouncer before declaring a server 'offline'.
- **Global Timer:** A `setInterval` ID stored in `DeviceSyncService.syncInterval` manages the background loop.
- **Mock Logic:** Extensive `if (USE_MOCK)` blocks allow the app to function fully without hardware for UI testing.

---

## 5. Navigation & UI Structure

The app uses `expo-router` with a filesystem-based routing structure.

**Directory:** `app/`

- `_layout.tsx`: Root layout. Handles Database Initialization, Authentication Guard, and Global Providers (Theme, Toast).
- `(auth)/`: Authentication screens (Login).
- `(tabs)/`: Main dashboard interface.
  - `index.tsx`: Home (Server status, Quick actions).
  - `devices.tsx`: Detailed node list and control.
  - `analytics.tsx`: Charts/Graphs of `data_points`.
  - `schedule.tsx`: Schedule management.
  - `alerts.tsx`: System notifications history.
  - `profile.tsx`: User settings.
- `devices/[id].tsx`: Dynamic route for device details.
- `settings/`: Sub-pages for configuration.

### Optimistic UI

- When a user toggles a switch, the UI updates immediately.
- The `DeviceSyncService.toggleNode` function performs the network request.
- If the request fails, the UI (via a re-sync or error boundary) would revert to the actual state.

### How it is Implemented in Code

- **Slot Pattern:** `_layout.tsx` validates state (Database Ready? User Logged In?) before rendering the `<Slot />`.
- **Route Groups:** Parentheses like `(tabs)` allow grouping routes without affecting the URL path, effectively managing Layouts.
- **Hooks:** Custom hooks like `useThemeColor` abstract implementation details of dark/light mode switching.

---

## 6. Authentication

**File:** `src/services/auth.ts`

- Wraps AWS Amplify (`@aws-amplify/react-native`).
- **Current State:** Includes a `USE_MOCK_AUTH` flag set to `true`. This bypasses actual Cognito calls and returns a mock session for development speed.
- To enable real auth, set `USE_MOCK_AUTH = false` and ensure `aws-exports.js` is present in `src/constants`.

### How it is Implemented in Code

- **Facade Pattern:** `AuthService` wraps Amplify calls. The rest of the app NEVER imports `aws-amplify` directly (except for configuration). This allows swapping Auth providers or using Mock mode easily.

---

## 7. Design System

**File:** `src/theme/`, `src/constants/theme.ts`

- **Approach:** Controlled token system.
- **Theme Context:** `ThemeContext.tsx` provides `light` or `dark` mode values.
- **Components:** Reusable UI components (`ThemedText`, `ThemedView`, `Card`, `Button`) consume these tokens, ensuring consistency across the app.
