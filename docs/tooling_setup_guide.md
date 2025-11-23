# Production Tooling Setup Guide

## 🛠️ What's Been Configured

### 1. Code Quality Tools

#### ESLint
- ✅ Already configured via `eslint.config.js`
- Uses Expo's recommended ESLint config
- Run: `npm run lint` or `npm run lint:fix`

#### Prettier
- ✅ Configured via `.prettierrc`
- Settings:
  - Single quotes
  - 2-space indentation
  - 100 character line width
  - Trailing commas (ES5)
- Run: `npm run format` or `npm run format:check`

#### TypeScript
- ✅ Configured via `tsconfig.json`
- Strict mode enabled
- Run type checking: `npm run type-check`

### 2. Git Hooks (Husky)

#### Pre-commit Hook
Automatically runs before each commit:
- ESLint check
- TypeScript type check
- Prettier format check

Location: `.husky/pre-commit`

### 3. CI/CD Pipeline (GitHub Actions)

#### Workflow: `.github/workflows/ci.yml`

**On Pull Request & Push:**
- ✅ Lint check
- ✅ TypeScript check
- ✅ Prettier check

**On Push to Main:**
- ✅ Build Android APK
- ✅ Build iOS IPA

**Required Secrets:**
- `EXPO_TOKEN` - Get from https://expo.dev/accounts/[account]/settings/access-tokens

### 4. Build Configuration (EAS)

#### File: `eas.json`

**Profiles:**
- `development` - For development builds
- `preview` - For internal testing (APK for Android)
- `production` - For app store releases

### 5. Editor Configuration

#### EditorConfig (`.editorconfig`)
- Consistent coding styles across editors
- UTF-8 encoding
- LF line endings
- 2-space indentation

#### VSCode Extensions (`.vscode/extensions.json`)
Recommended extensions:
- Prettier
- ESLint
- Expo Tools
- EditorConfig
- TypeScript

## 📦 Installation Steps

### 1. Install New Dependencies

```bash
npm install
```

This will install:
- `prettier` - Code formatter
- `husky` - Git hooks manager

### 2. Initialize Husky

```bash
npm run prepare
```

This sets up Git hooks in `.husky/` directory.

### 3. Make Pre-commit Hook Executable

```bash
chmod +x .husky/pre-commit
```

### 4. Test the Setup

```bash
# Run linter
npm run lint

# Run type check
npm run type-check

# Run formatter check
npm run format:check

# Format all files
npm run format
```

## 🚀 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check if files are formatted |
| `npm run type-check` | Run TypeScript compiler check |
| `npm run prepare` | Set up Husky git hooks |

## 🔧 GitHub Actions Setup

### 1. Add Expo Token Secret

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `EXPO_TOKEN`
5. Value: Your Expo access token from https://expo.dev

### 2. Configure EAS Build (Optional)

If you want automated builds:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure builds
eas build:configure
```

## 🎯 Pre-commit Workflow

When you commit code, the following happens automatically:

1. **ESLint Check** - Ensures code follows style guidelines
2. **TypeScript Check** - Catches type errors
3. **Prettier Check** - Ensures consistent formatting

If any check fails, the commit is blocked. Fix the issues and try again.

### Bypass Pre-commit (Not Recommended)

```bash
git commit --no-verify -m "message"
```

## 📝 Best Practices

### Before Committing

```bash
# 1. Format your code
npm run format

# 2. Fix linting issues
npm run lint:fix

# 3. Check types
npm run type-check

# 4. Commit
git add .
git commit -m "feat: your feature"
```

### Code Review Checklist

- [ ] All linting errors fixed
- [ ] No TypeScript errors
- [ ] Code is formatted with Prettier
- [ ] Tests pass (if applicable)
- [ ] No console.log statements in production code
- [ ] Comments added for complex logic

## 🔍 Troubleshooting

### Husky hooks not running

```bash
# Reinstall husky
rm -rf .husky
npm run prepare
chmod +x .husky/pre-commit
```

### Prettier conflicts with ESLint

The current configuration is compatible. If issues arise:
- Prettier handles formatting
- ESLint handles code quality

### CI/CD failing

Check:
1. `EXPO_TOKEN` secret is set in GitHub
2. All dependencies are in `package.json`
3. No syntax errors in workflow file

## 📚 Additional Resources

- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

**Last Updated**: 2025-11-23
