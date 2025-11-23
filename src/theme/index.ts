export const LightColors = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: {
    primary: '#1A1C1E',
    secondary: '#6C757D',
    light: '#FFFFFF',
  },
  primary: '#003366', // Dark Blue
  accent: '#007AFF', // Bright Blue
  success: '#2ECC71', // Green
  error: '#E74C3C', // Red
  warning: '#F1C40F', // Yellow
  border: '#E9ECEF',
  divider: '#DEE2E6',
  tint: '#003366',
};

export const DarkColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: {
    primary: '#E0E0E0',
    secondary: '#A0A0A0',
    light: '#FFFFFF',
  },
  primary: '#90CAF9', // Light Blue
  accent: '#64B5F6',
  success: '#81C784',
  error: '#E57373',
  warning: '#FFF176',
  border: '#333333',
  divider: '#2C2C2C',
  tint: '#90CAF9',
};

export type ThemeColors = typeof LightColors;

// Default export for backward compatibility during refactor (Points to Light)
export const Colors = LightColors;

export const Typography = {
  header: {
    fontSize: 24,
    fontWeight: '700' as '700',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600' as '600',
  },
  body: {
    fontSize: 14,
  },
  caption: {
    fontSize: 12,
  },
};

export const Layout = {
  padding: 16,
  borderRadius: 12,
  gap: 12,
};
