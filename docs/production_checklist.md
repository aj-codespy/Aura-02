# Production Deployment Checklist

## ⚠️ CRITICAL - Before Pushing to GitHub

### 1. Security & Credentials

- [ ] **AWS Credentials**: Ensure `src/constants/aws-exports.js` is NOT committed
  - Verify it's in `.gitignore`
  - Only commit `aws-exports.example.js`
  - Document setup steps in README
- [ ] **Environment Variables**: Check for any hardcoded secrets
  - API keys
  - Database credentials
  - Third-party service tokens

### 2. Configuration Files

- [ ] **app.json**: Update bundle identifiers

  ```json
  "ios": {
    "bundleIdentifier": "com.yourcompany.projectaura"  // Change this!
  },
  "android": {
    "package": "com.yourcompany.projectaura"  // Change this!
  }
  ```

- [ ] **package.json**: Verify app name and version
  - Update `name` field if needed
  - Set appropriate version number

### 3. Code Quality

- [ ] **Remove Development Code**:
  - [ ] Remove or comment out `DROP TABLE` statements in `src/database/index.ts` (line 17-22)
  - [ ] Set `USE_MOCK = false` in `src/services/deviceSync.ts` for production
  - [ ] Remove console.log statements (optional)

- [ ] **TODOs**: Address or document remaining TODOs
  - `src/services/deviceSync.ts:198` - Add api_id column to nodes

- [ ] **Error Handling**: Verify all try-catch blocks have proper error handling

### 4. Database

- [ ] **Schema**: Ensure database schema is production-ready
  - Remove DROP TABLE statements for production
  - Keep cleanup queries for old data
- [ ] **Migrations**: Document any required database migrations

### 5. Performance

- [ ] **Sync Frequency**: Verify background sync interval (currently 30s)
- [ ] **Memory Management**:
  - Energy data logging reduced (every 3rd sync)
  - Duplicate alert prevention enabled
  - Database cleanup on init enabled

### 6. Documentation

- [ ] **README.md**: Updated with:
  - Installation instructions
  - Configuration steps
  - Known issues
  - Troubleshooting guide

- [ ] **Code Comments**: Add comments for complex logic

- [ ] **API Documentation**: Document hardware API endpoints if applicable

### 7. Testing

- [ ] **Fresh Install**: Test app on clean device/emulator
- [ ] **Database Init**: Verify database initializes correctly
- [ ] **Theme Toggle**: Test light/dark mode switching
- [ ] **Navigation**: Test all screen transitions
- [ ] **Memory**: Run for extended period to check for leaks

### 8. Build Configuration

- [ ] **iOS**:
  - Update `ios/` folder if using bare workflow
  - Configure signing certificates
- [ ] **Android**:
  - Update `android/` folder if using bare workflow
  - Configure signing keys for release builds

### 9. Git Hygiene

- [ ] **Commit Messages**: Use clear, descriptive commit messages
- [ ] **Branch Strategy**: Follow your team's branching strategy
- [ ] **.gitignore**: Verify all sensitive files are ignored
- [ ] **Large Files**: Check for accidentally committed large files

### 10. Pre-Push Commands

```bash
# Run linter
npm run lint

# Check for TypeScript errors
npx tsc --noEmit

# Test build
npm run android  # or npm run ios

# Verify gitignore
git status  # Ensure no sensitive files are staged
```

## Production-Specific Changes Needed

### Remove Development Features

1. **Database Reset** (`src/database/index.ts`):

   ```typescript
   // REMOVE these lines for production:
   DROP TABLE IF EXISTS alerts;
   DROP TABLE IF EXISTS energy_data;
   // ... etc
   ```

2. **Mock Mode** (`src/services/deviceSync.ts`):
   ```typescript
   // Change to false for production:
   const USE_MOCK = false;
   ```

### Add Production Features

1. **Error Reporting**: Consider adding Sentry or similar
2. **Analytics**: Add analytics tracking if needed
3. **Crash Reporting**: Implement crash reporting
4. **API Endpoints**: Configure production API URLs

## Deployment Platforms

### Expo EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### App Store Submission

- [ ] Prepare app screenshots
- [ ] Write app description
- [ ] Set up App Store Connect / Google Play Console
- [ ] Submit for review

## Post-Deployment

- [ ] Monitor crash reports
- [ ] Check user feedback
- [ ] Monitor memory usage on various devices
- [ ] Track API usage and performance

---

**Last Updated**: 2025-11-23
**Version**: 1.0.0
