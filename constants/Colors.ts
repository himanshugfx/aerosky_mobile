// AeroSky Color Theme
// Aviation-inspired color palette

const primaryBlue = '#2563EB'; // Vibrant Indigo-Blue
const darkNavy = '#0F172A'; // Deep Slate Navy
const accentIndigo = '#6366F1';
const successEmerald = '#10B981';
const warningAmber = '#F59E0B';
const errorRose = '#F43F5E';

const lightTheme = {
  // Core colors
  text: '#1E293B',
  textSecondary: '#64748B',
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',

  // Brand colors
  primary: primaryBlue,
  primaryLight: '#60A5FA',
  accent: accentIndigo,

  // Status colors
  success: successEmerald,
  warning: warningAmber,
  error: errorRose,

  // UI colors
  tint: primaryBlue,
  border: '#E2E8F0',
  tabIconDefault: '#94A3B8',
  tabIconSelected: primaryBlue,

  // Specific UI elements
  inputBackground: '#F1F5F9',
  inputBorder: '#CBD5E1',
  glassBackground: 'rgba(255, 255, 255, 0.9)',
};

export default {
  light: lightTheme,
  // FORCED LIGHT MODE: Returning light theme for 'dark' key as well
  dark: lightTheme,
};

// Common spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 40,
};

// Common font sizes
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};

// Common border radius
export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};
