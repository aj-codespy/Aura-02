# Data Export/Import System - Implementation Plan

## Goal

Implement comprehensive data export/import functionality with CSV format support and automatic 30-day backup reminders.

## Features

### 1. Data Export

- [x] Export all data to CSV format
- [x] Separate files for each data type (devices, schedules, energy data, alerts)
- [x] Include metadata (export date, app version, data counts)
- [x] Share via native share sheet

### 2. Data Import

- [x] Import CSV files
- [x] Validate data format
- [x] Merge with existing data (avoid duplicates)
- [x] Show import summary

### 3. Backup Reminders

- [x] Check last backup date on app launch
- [x] Show reminder every 30 days
- [x] Store reminder preference in AsyncStorage
- [x] Allow "Remind me later" or "Backup now"

---

## Proposed Changes

### Services

#### [NEW] [dataExport.ts](file:///Users/aj_builds/Documents/ProjectAura/src/services/dataExport.ts)

- [x] `exportAllData()` - Export all tables to CSV
- [x] `exportEnergyData()` - Export energy data only
- [x] `exportSchedules()` - Export schedules only
- [x] `importData()` - Import from CSV files
- [x] `validateImportData()` - Validate CSV format
- [x] CSV generation utilities

#### [MODIFY] [repository.ts](file:///Users/aj_builds/Documents/ProjectAura/src/database/repository.ts)

- [x] Add `getLastBackupDate()` method
- [x] Add `setLastBackupDate()` method
- [x] Add `getAllEnergyData()` for export
- [x] Add `bulkInsertEnergyData()` for import

---

### UI Components

#### [NEW] [DataExportScreen.tsx](file:///Users/aj_builds/Documents/ProjectAura/app/settings/data-export.tsx)

- [x] Export options (All data, Energy only, Schedules only)
- [x] Import button
- [x] Last backup date display
- [x] Export history

#### [MODIFY] [settings/index.tsx](file:///Users/aj_builds/Documents/ProjectAura/app/settings/index.tsx)

- [x] Add "Data Export" menu item
- [x] Show last backup date badge

#### [NEW] [BackupReminderModal.tsx](file:///Users/aj_builds/Documents/ProjectAura/src/components/modals/BackupReminderModal.tsx)

- [x] 30-day reminder modal
- [x] "Backup Now" button
- [x] "Remind me later" button
- [x] "Don't remind again" option

---

### Storage

#### [MODIFY] [app/\_layout.tsx](file:///Users/aj_builds/Documents/ProjectAura/app/_layout.tsx)

- [x] Check backup reminder on app launch
- [x] Show modal if 30+ days since last backup

---

## CSV Format Specification

### Energy Data CSV

```csv
timestamp,node_id,node_name,voltage,current,power,energy,temperature
2025-11-23T10:00:00Z,1,Fan 1,230.5,2.3,529.15,0.529,45.2
```

### Schedules CSV

```csv
id,node_id,node_name,time,days,action,is_active
1,1,Fan 1,08:00,1234567,on,1
```

### Devices CSV

```csv
id,name,type,category,status,temperature,server_id
1,Fan 1,FAN,Assembly Line 1,on,45.2,1
```

### Alerts CSV

```csv
id,node_id,node_name,severity,message,created_at,is_read
1,1,Fan 1,critical,Overheating detected,2025-11-23T10:00:00Z,0
```

---

## Verification Plan

### Export Testing

1. [x] Export all data
2. [x] Verify CSV files created
3. [x] Check CSV format is valid
4. [x] Verify all data included
5. [x] Test share functionality

### Import Testing

1. [x] Import exported CSV
2. [x] Verify data appears in app
3. [x] Check analytics show imported data
4. [x] Test duplicate handling
5. [x] Test invalid CSV handling

### Reminder Testing

1. [x] Set last backup to 31 days ago
2. [x] Restart app
3. [x] Verify reminder appears
4. [x] Test "Backup Now" action
5. [x] Test "Remind me later" action

---

## Dependencies

- [x] `expo-file-system` - File operations
- [x] `expo-sharing` - Share files
- [x] `@react-native-async-storage/async-storage` - Store backup date

---

## Timeline

- Export service: 2 hours
- Import service: 2 hours
- UI screens: 2 hours
- Reminder system: 1 hour
- Testing: 1 hour

**Total:** 8 hours
