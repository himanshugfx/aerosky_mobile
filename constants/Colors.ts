// AeroSky Color Theme
// Aviation-inspired color palette

const primaryBlue = '#0066CC';
const accentOrange = '#FF6B35';
const successGreen = '#22C55E';
const warningYellow = '#EAB308';
const errorRed = '#EF4444';

export default {
  light: {
    // Core colors
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#F9FAFB',
    cardBackground: '#FFFFFF',

    // Brand colors
    primary: primaryBlue,
    primaryLight: '#3B82F6',
    accent: accentOrange,

    // Status colors
    success: successGreen,
    warning: warningYellow,
    error: errorRed,

    // UI colors
    tint: primaryBlue,
    border: '#E5E7EB',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryBlue,

    // Specific UI elements
    inputBackground: '#F3F4F6',
    inputBorder: '#D1D5DB',
  },
  dark: {
    // Core colors
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#111827',
    cardBackground: '#1F2937',

    // Brand colors
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    accent: accentOrange,

    // Status colors
    success: successGreen,
    warning: warningYellow,
    error: errorRed,

    // UI colors
    tint: '#60A5FA',
    border: '#374151',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#60A5FA',

    // Specific UI elements
    inputBackground: '#374151',
    inputBorder: '#4B5563',
  },
};

// Common spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Common font sizes
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Common border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
