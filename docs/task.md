# Aura App - Implementation Tasks

## Module 1: User Onboarding & Identity (Cloud Handshake)
- [ ] **AWS Cognito Integration**
    - [ ] Replace mock `AuthService` with real AWS Amplify Auth
    - [ ] Implement Sign Up, Sign In, Forgot Password screens
- [ ] **Magic Sync (S3 Config)**
    - [ ] Create S3 service to fetch user configuration
    - [ ] Implement "First Run" logic to seed local DB from S3 config
- [ ] **Multi-Device Sync**
    - [ ] Ensure device list updates on login

## Module 2: Device Management & Control (Remote Control)
- [ ] **Local LAN API**
    - [ ] Implement `HardwareService` to communicate with physical devices (HTTP/WebSocket)
    - [ ] Replace `MockHardware` with real network calls (or advanced mock for testing)
- [ ] **Device Grouping**
    - [ ] Update `nodes` table to support groups/categories
    - [ ] Implement "Filter by Category" in Device List
- [ ] **QR Code Pairing**
    - [ ] Implement QR Code Scanner UI
    - [ ] Implement pairing logic (send token to local server)
- [ ] **Live Status**
    - [ ] Ensure UI updates reflect real-time status changes

## Module 3: Connectivity & Offline Reliability
- [ ] **Smart Network Discovery**
    - [ ] Implement mDNS / Network Scan to find Server IPs
    - [ ] Auto-update `servers` table with new IPs
- [ ] **Background Sync**
    - [ ] Implement robust background polling (using `expo-background-fetch` or similar)
    - [ ] Handle offline/online state transitions gracefully

## Module 4: Intelligence & Alerting
- [ ] **Local Logic Engine**
    - [ ] Implement rules engine (e.g., "If Temp > X then Alert")
    - [ ] Decouple logic from Sync Service
- [x] **Notifications**
    - [x] Implement Local Push Notifications for critical alerts

## Module 5: Energy Analytics
- [ ] **Data Ingestion**
    - [ ] Create `energy_data` table for historical logging
    - [ ] Implement periodic data archiving from nodes
- [ ] **Visualization**
    - [ ] Implement Real-time Voltage/Current display
    - [ ] Implement Historical Charts (24h, Week)
    - [ ] Implement "Top Consumers" list

## Module 6: Automation & Scheduling
- [ ] **Schedule Management**
    - [ ] **Repository & Service Updates**
        - [ ] Add `updateSchedule` and `deleteSchedule` to Repository
        - [ ] Add `updateSchedule` and `deleteSchedule` to HardwareService
    - [ ] **Schedule UI**
        - [ ] Create Schedule List with Edit/Delete actions
        - [ ] Create Add/Edit Schedule Form (Time, Days, Action, Device)

- [ ] **Hardware Sync**
    - [ ] Implement logic to push schedules to hardware nodes

## Module 7: Settings & Data Portability
- [x] **Data Export & Import**
    - [x] Implement CSV Export of energy data, schedules, devices, and alerts
    - [x] Implement CSV Import with validation
    - [x] Implement 30-day Backup Reminder system
- [ ] **Profile & Settings**
    - [ ] Finalize Theme switching
    - [ ] Manage User Profile
