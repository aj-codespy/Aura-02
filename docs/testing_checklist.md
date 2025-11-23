# Testing Checklist - ProjectAura

## 🎯 What to Test Now

Based on the original project objectives and current implementation, here's what needs testing:

---

## ✅ Implemented & Ready to Test

### 1. **Database Layer** ⭐ HIGH PRIORITY

**Status**: Fully implemented with SQLite

**Test Cases:**

```bash
# Run database tests
# Uncomment in app/_layout.tsx:
# await runDBTests();
```

- [ ] Database initialization on first launch
- [ ] Tables created correctly (users, servers, nodes, schedules, energy_data, alerts)
- [ ] CRUD operations for all entities
- [ ] Data persistence across app restarts
- [ ] Database cleanup (old data removal)
- [ ] Memory management (no OOM errors)

**How to Test:**

1. Clear app data completely
2. Launch app fresh
3. Check console logs for "Database initialized successfully"
4. Navigate through all screens to trigger data creation
5. Close and reopen app - verify data persists

---

### 2. **Device Management** ⭐ HIGH PRIORITY

**Status**: UI complete, Mock data mode active

**Test Cases:**

- [ ] View all device categories (Home screen)
- [ ] Navigate to category-specific device list
- [ ] Toggle device ON/OFF (optimistic UI update)
- [ ] View device status and temperature
- [ ] Add new device flow (QR scanner UI)
- [ ] Device status updates in real-time (every 30s sync)

**How to Test:**

1. Go to Devices tab
2. Tap on a category (e.g., "Assembly Line 1")
3. Toggle devices ON/OFF
4. Verify UI updates immediately
5. Wait 30 seconds, check if sync updates data
6. Tap "+" to test Add Device flow

**Known Limitation:** Currently using mock data. Real hardware testing requires:

- Set `USE_MOCK = false` in `src/services/deviceSync.ts`
- Configure actual server IPs

---

### 3. **Schedule Management** ⭐ HIGH PRIORITY

**Status**: Fully implemented with CRUD operations

**Test Cases:**

- [ ] View existing schedules
- [ ] Create new schedule (device, time, days, action)
- [ ] Edit existing schedule
- [ ] Delete schedule (with confirmation)
- [ ] Time validation (HH:MM format)
- [ ] Day selection (Mon-Sun)
- [ ] Haptic feedback on interactions

**How to Test:**

1. Go to Schedule tab
2. Tap "Add New Schedule"
3. Select device, set time (e.g., "14:30"), choose days, set action
4. Save and verify it appears in list
5. Edit schedule, change time
6. Delete schedule, confirm deletion

**Known Issue:** Schedules sync to local DB but hardware sync needs real API

---

### 4. **Analytics Dashboard** ⭐ MEDIUM PRIORITY

**Status**: Implemented with mock data visualizations

**Test Cases:**

- [ ] Energy line chart displays (7-day trend)
- [ ] Usage heatmap shows peak hours
- [ ] Category pie chart shows distribution
- [ ] Schedule widget displays upcoming schedules
- [ ] Charts render without errors
- [ ] Data updates on refresh

**How to Test:**

1. Go to Analytics tab
2. Verify all 3 charts render:
   - Line chart (energy over time)
   - Heatmap (usage by hour/day)
   - Pie chart (category breakdown)
3. Check schedule widget at bottom
4. Pull to refresh

**Known Limitation:** Using mock data - needs real energy_data from database

---

### 5. **Dark Mode** ⭐ MEDIUM PRIORITY

**Status**: Fully implemented with persistence

**Test Cases:**

- [ ] Toggle dark mode in Settings → Appearance
- [ ] All screens adapt to theme
- [ ] Theme persists across app restarts
- [ ] Tab bar updates colors
- [ ] No visual glitches during transition

**How to Test:**

1. Go to Settings → Appearance
2. Toggle "Dark Mode"
3. Navigate through all screens
4. Close app completely
5. Reopen - verify theme persists

---

### 6. **Alerts System** ⭐ MEDIUM PRIORITY

**Status**: Database + UI implemented, logic active

**Test Cases:**

- [ ] Alerts created when temperature > 80°C
- [ ] Alerts appear on Home screen (Recent Alerts)
- [ ] Navigate to Alerts tab to see all
- [ ] Mark alerts as read
- [ ] No duplicate alerts for same issue

**How to Test:**

1. Wait for sync to create alerts (temp > 80°C in mock data)
2. Check Home screen for "Recent Alerts" section
3. Tap Alerts icon in header
4. Verify alerts listed
5. Check that duplicates aren't created on next sync

---

### 7. **Background Sync** ⭐ HIGH PRIORITY

**Status**: Implemented, runs every 30 seconds

**Test Cases:**

- [ ] Sync starts after app initialization
- [ ] Runs every 30 seconds
- [ ] Updates device status
- [ ] Creates alerts when needed
- [ ] Logs energy data (every 3rd sync)
- [ ] No memory leaks over time
- [ ] Stops when app is closed

**How to Test:**

1. Launch app
2. Watch console logs for "Starting Device Sync..."
3. Should appear every 30 seconds
4. Leave app running for 5 minutes
5. Check memory usage doesn't grow excessively
6. Close app, verify sync stops

---

### 8. **Settings & Navigation** ⭐ LOW PRIORITY

**Status**: Fully implemented

**Test Cases:**

- [ ] Settings screen accessible from Home
- [ ] Navigate to Profile (placeholder)
- [ ] Navigate to Notifications/Alerts
- [ ] Navigate to Appearance (Dark Mode)
- [ ] Navigate to Help & Support (FAQs)
- [ ] Back navigation works on all screens

**How to Test:**

1. Tap Settings icon on Home screen
2. Test each menu item
3. Verify back button works
4. Check all screens render correctly

---

## ❌ Not Yet Implemented - Future Testing

### 9. **AWS Cognito Authentication**

**Status**: Placeholder only

**Needs:**

- Real AWS Cognito credentials
- Sign Up / Sign In screens (login.tsx is placeholder)
- Token management
- Session persistence

### 10. **Real Hardware API Integration**

**Status**: Service layer ready, needs real endpoints

**Needs:**

- Physical hardware or real API server
- Set `USE_MOCK = false`
- Configure actual IP addresses
- Test real device control

### 11. **Network Discovery**

**Status**: Not implemented

**Needs:**

- mDNS/Bonjour implementation
- Auto-discovery of local servers
- IP address management

---

## 🧪 Critical Test Scenarios

### Scenario 1: Fresh Install

1. Uninstall app completely
2. Reinstall
3. Verify database initializes
4. Check all screens load
5. Create a schedule
6. Toggle dark mode
7. Restart app - verify data persists

### Scenario 2: Memory Stress Test

1. Leave app running for 30 minutes
2. Monitor memory usage
3. Check for OOM errors
4. Verify database size stays reasonable
5. Check background sync continues working

### Scenario 3: Offline Behavior

1. Turn off WiFi
2. Try to use app
3. Verify graceful degradation
4. Turn WiFi back on
5. Check sync resumes

### Scenario 4: Multi-Device Sync (Future)

1. Login on Device A
2. Create schedule
3. Login on Device B
4. Verify schedule appears (needs cloud sync)

---

## 🐛 Known Issues to Verify Fixed

1. **Database Lock Error** - Should be fixed
   - Test: Fresh install, rapid navigation
   - Expected: No "database table is locked" errors

2. **Out of Memory** - Should be fixed
   - Test: Run for extended period
   - Expected: Memory stays under 100MB

3. **Duplicate Nodes** - Should be fixed
   - Test: Multiple syncs
   - Expected: Node count stays constant

4. **Duplicate Alerts** - Should be fixed
   - Test: Multiple syncs with high temp
   - Expected: Only one alert per issue

---

## 📊 Performance Benchmarks

**Target Metrics:**

- App launch: < 3 seconds
- Screen navigation: < 500ms
- Database queries: < 100ms
- Sync cycle: < 2 seconds
- Memory usage: < 150MB (Android)
- Battery drain: < 5% per hour

---

## 🔧 Testing Tools

**Manual Testing:**

```bash
# Start app
npm start

# Clear app data (Android)
adb shell pm clear com.yourname.projectaura

# Monitor logs
npx react-native log-android
# or
npx react-native log-ios
```

**Automated Testing (Future):**

- Jest for unit tests
- Detox for E2E tests
- Maestro for UI testing

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] All critical tests pass
- [ ] No memory leaks
- [ ] No database errors
- [ ] Dark mode works on all screens
- [ ] Real AWS credentials configured
- [ ] Real hardware API tested
- [ ] Performance benchmarks met
- [ ] Error handling tested
- [ ] Offline mode tested

---

**Priority Order:**

1. Database Layer (foundation)
2. Device Management (core feature)
3. Schedule Management (core feature)
4. Background Sync (critical for UX)
5. Analytics (nice to have)
6. Dark Mode (polish)
7. Settings/Navigation (basic)

**Estimated Testing Time:** 2-3 hours for comprehensive manual testing
