# Navigation Flow Testing Guide

## 📱 Complete Navigation Map

### Tab Navigation (Bottom Bar)
```
Home (/) ←→ Devices ←→ Schedule ←→ Analytics
```

### Full Navigation Tree
```
App Root
├── (tabs)/
│   ├── index (Home) ✅
│   ├── devices ✅
│   ├── schedule ✅
│   ├── analytics ✅
│   ├── alerts ✅
│   └── profile (hidden) ✅
│
├── devices/
│   ├── [id] (Category List) ✅
│   └── add (Add Device) ✅
│
├── settings/
│   ├── index (Settings Menu) ✅
│   ├── appearance (Dark Mode) ✅
│   └── help (Help & Support) ✅
│
└── (auth)/
    └── login (Placeholder) ✅
```

---

## 🧪 Navigation Test Scenarios

### Test 1: Home Screen Navigation
**Path:** Home → Settings → Appearance → Back → Back → Home

**Steps:**
1. Launch app → Home screen
2. Tap Settings icon (top right)
3. ✅ Navigate to Settings screen
4. Tap "Appearance"
5. ✅ Navigate to Appearance screen
6. Tap back button (top left)
7. ✅ Return to Settings screen
8. Tap back button again
9. ✅ Return to Home screen

**Expected:** All back buttons work, no navigation errors

---

### Test 2: Devices Flow
**Path:** Home → Devices Tab → Category → Back → Devices

**Steps:**
1. From Home, tap Devices tab
2. ✅ Navigate to Devices screen (categories list)
3. Tap any category (e.g., "Assembly Line 1")
4. ✅ Navigate to Device List screen
5. Tap back button
6. ✅ Return to Devices screen (categories)
7. Tap Home tab
8. ✅ Return to Home screen

**Expected:** Back button returns to categories, not Home

---

### Test 3: Add Device Flow
**Path:** Devices → Add Device → Back → Devices

**Steps:**
1. Navigate to Devices tab
2. Tap "+" button (Add Device)
3. ✅ Navigate to Add Device screen (QR scanner)
4. Tap back button
5. ✅ Return to Devices screen

**Expected:** Back button works, no QR scanner errors

---

### Test 4: Settings Deep Navigation
**Path:** Home → Settings → Help → Back → Settings → Appearance → Back → Settings → Back → Home

**Steps:**
1. Home → Tap Settings icon
2. ✅ Settings screen
3. Tap "Help & Support"
4. ✅ Help screen
5. Tap back
6. ✅ Settings screen
7. Tap "Appearance"
8. ✅ Appearance screen
9. Tap back
10. ✅ Settings screen
11. Tap back
12. ✅ Home screen

**Expected:** All back navigation works correctly

---

### Test 5: Schedule Flow
**Path:** Schedule Tab → Add Schedule → Cancel → Schedule

**Steps:**
1. Tap Schedule tab
2. ✅ Schedule screen
3. Tap "Add New Schedule"
4. ✅ Modal appears
5. Tap outside modal or Cancel
6. ✅ Modal closes, return to Schedule screen

**Expected:** Modal dismisses correctly

---

### Test 6: Alerts Navigation
**Path:** Home → Alerts Button → Alerts Screen → Back → Home

**Steps:**
1. From Home screen
2. Tap Alerts icon (top left)
3. ✅ Navigate to Alerts screen
4. Tap back button
5. ✅ Return to Home screen

**Expected:** Back navigation works

---

### Test 7: Notification Tap Navigation
**Path:** Any Screen → Notification Tap → Alerts Screen

**Steps:**
1. Be on any screen (Home, Devices, etc.)
2. Receive notification
3. Tap notification
4. ✅ Navigate to Alerts screen
5. Tap back button
6. ✅ Return to previous screen

**Expected:** Navigation preserves back stack

---

### Test 8: Tab Switching
**Path:** Home → Devices → Schedule → Analytics → Home

**Steps:**
1. Start on Home tab
2. Tap Devices tab
3. ✅ Switch to Devices
4. Tap Schedule tab
5. ✅ Switch to Schedule
6. Tap Analytics tab
7. ✅ Switch to Analytics
8. Tap Home tab
9. ✅ Return to Home

**Expected:** Tab state preserved, no navigation errors

---

### Test 9: Deep Link + Back
**Path:** Devices → Category → Device List → Home Tab → Back Button

**Steps:**
1. Navigate to Devices tab
2. Tap category
3. ✅ Device list appears
4. Tap Home tab
5. ✅ Switch to Home
6. Press Android back button
7. ✅ Should exit app (not go back to device list)

**Expected:** Tab switching clears navigation stack

---

### Test 10: Settings from Different Tabs
**Path:** Devices Tab → Settings → Back → Devices Tab

**Steps:**
1. Navigate to Devices tab
2. Tap Settings icon
3. ✅ Settings screen
4. Tap back
5. ✅ Return to Devices tab (not Home)

**Expected:** Back returns to originating tab

---

## 🔍 Navigation Issues to Check

### Common Problems

1. **Back Button Not Appearing**
   - Check: `headerShown: false` in Stack.Screen
   - Fix: Ensure screens have proper header configuration

2. **Back Goes to Wrong Screen**
   - Check: Navigation stack order
   - Fix: Use `router.push()` not `router.replace()`

3. **Modal Not Dismissing**
   - Check: Modal `visible` state
   - Fix: Ensure `setModalVisible(false)` on close

4. **Tab State Lost**
   - Check: Tab navigator configuration
   - Fix: Ensure each tab has independent navigation

5. **Deep Link Breaking Navigation**
   - Check: Notification navigation code
   - Fix: Use proper route paths

---

## ✅ Navigation Verification Checklist

### Header Configuration
- [ ] All screens have back button (except tabs)
- [ ] Settings icon visible on Home
- [ ] Alerts icon visible on Home
- [ ] Add Device button visible on Devices

### Back Navigation
- [ ] Settings → Appearance → Back works
- [ ] Settings → Help → Back works
- [ ] Devices → Category → Back works
- [ ] Devices → Add Device → Back works
- [ ] Alerts → Back works

### Tab Navigation
- [ ] All 4 tabs accessible
- [ ] Tab switching preserves state
- [ ] Tab icons correct
- [ ] Active tab highlighted

### Modal Navigation
- [ ] Schedule modal opens
- [ ] Schedule modal closes
- [ ] Modal doesn't break navigation

### Deep Links
- [ ] Notification tap navigates correctly
- [ ] Back button works after notification

---

## 🐛 Known Navigation Issues

### Issue 1: Settings Back Button
**Status:** ✅ Fixed
**Location:** `app/settings/index.tsx`
**Solution:** Uses `router.back()` correctly

### Issue 2: Device Category Navigation
**Status:** ✅ Fixed
**Location:** `app/devices/[id].tsx`
**Solution:** Dynamic route with proper back navigation

### Issue 3: Tab Bar Overlap
**Status:** ✅ Fixed
**Location:** `app/(tabs)/_layout.tsx`
**Solution:** Increased tab bar height and padding

---

## 📊 Navigation Code Review

### Correct Navigation Patterns

✅ **Good - Using router.push():**
```typescript
router.push('/settings/appearance');
```

✅ **Good - Using router.back():**
```typescript
<TouchableOpacity onPress={() => router.back()}>
  <Ionicons name="arrow-back" />
</TouchableOpacity>
```

✅ **Good - Tab navigation:**
```typescript
<Tabs.Screen name="index" options={{ title: 'Home' }} />
```

❌ **Bad - Direct navigation without router:**
```typescript
navigation.navigate('Screen'); // Don't use
```

---

## 🚀 Testing Commands

### Manual Testing
```bash
# 1. Start app
npm start

# 2. Test on device
# - Navigate through all screens
# - Use back button at each level
# - Switch tabs frequently
# - Test notification navigation

# 3. Check console for errors
# Look for navigation warnings
```

### Automated Testing (Future)
```bash
# Using Detox or Maestro
detox test --configuration ios.sim.debug
```

---

## 📝 Navigation Best Practices

1. **Always use Expo Router methods:**
   - `router.push()` for forward navigation
   - `router.back()` for back navigation
   - `router.replace()` for replacing current screen

2. **Preserve navigation stack:**
   - Don't use `replace()` unless necessary
   - Let tabs maintain independent stacks

3. **Handle back button:**
   - Android back button should work naturally
   - iOS swipe back should work

4. **Test edge cases:**
   - Rapid navigation
   - Back button spam
   - Tab switching during navigation

---

**Status:** Ready for testing
**Priority:** High - Core UX feature
**Estimated Testing Time:** 15-20 minutes
