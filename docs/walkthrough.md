# Walkthrough - Dark Mode

I have implemented **Dark Mode** support for the application.

## Implementation Details

- **Theme System**: Refactored `src/theme/index.ts` to support `LightColors` and `DarkColors`.
- **Context**: Created `ThemeContext` to manage global theme state and persistence.
- **Screens Updated**:
  - **Settings Flow**: All settings screens (`Settings`, `Appearance`, `Help`) are fully themed.
  - **Home Screen**: The main dashboard now adapts to the selected theme.
  - **Tab Bar**: The bottom navigation bar adapts to the theme.

## How to Use

1.  Go to **Settings** -> **Appearance**.
2.  Toggle **Dark Mode**.
3.  Observe the app switching between Light and Dark themes.

## Verification Steps

1.  **Toggle Theme**: Switch Dark Mode ON/OFF in Settings.
2.  **Check Home**: Verify the Home screen background and text colors change.
3.  **Check Tab Bar**: Verify the bottom tab bar colors change.
4.  **Persistence**: Restart the app (if possible) to verify the theme preference is saved.
