# Production Tooling - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Initialize git hooks
npm run prepare

# 3. Test everything works
npm run lint && npm run type-check && npm run format:check
```

## 📋 Daily Commands

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

## 🔄 Pre-commit Workflow

**Automatic (via Husky):**

- Runs on every `git commit`
- Checks: ESLint, TypeScript, Prettier
- Blocks commit if checks fail

**Manual bypass (not recommended):**

```bash
git commit --no-verify -m "message"
```

## 🏗️ Build Commands

```bash
# Development build
eas build --profile development --platform android

# Preview build (internal testing)
eas build --profile preview --platform android

# Production build
eas build --profile production --platform android
```

## 📦 Configuration Files

| File                       | Purpose                       |
| -------------------------- | ----------------------------- |
| `.prettierrc`              | Code formatting rules         |
| `.prettierignore`          | Files to skip formatting      |
| `.editorconfig`            | Editor settings               |
| `.husky/pre-commit`        | Git pre-commit hook           |
| `.github/workflows/ci.yml` | CI/CD pipeline                |
| `eas.json`                 | Build configurations          |
| `.vscode/extensions.json`  | Recommended VSCode extensions |

## ✅ Pre-Push Checklist

```bash
# Run all checks
npm run lint && npm run type-check && npm run format:check

# If any fail, fix them:
npm run format        # Fix formatting
npm run lint:fix      # Fix linting

# Then commit
git add .
git commit -m "your message"
git push
```

## 🔧 Troubleshooting

**Husky not working?**

```bash
rm -rf .husky
npm run prepare
chmod +x .husky/pre-commit
```

**Prettier/ESLint conflicts?**

```bash
npm run format  # Prettier wins for formatting
npm run lint:fix  # ESLint for code quality
```

**CI failing on GitHub?**

- Check `EXPO_TOKEN` secret is set
- Verify all dependencies in package.json
- Check workflow syntax in `.github/workflows/ci.yml`

---

**For detailed documentation, see `tooling_setup_guide.md`**
