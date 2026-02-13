// API Configuration
// Update this URL to your deployed backend URL

import { Platform } from 'react-native';

// Get the correct API URL based on platform
function getApiUrl(): string {
    // For web development
    if (Platform.OS === 'web') {
        // When running locally, use localhost
        // When deployed, this will be the same domain
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return 'http://localhost:3000';
        }
        // For production web
        return 'https://your-aerosky-app.vercel.app';
    }

    // For native development (Android/iOS)
    // Android emulator uses 10.0.2.2 to reach host machine's localhost
    // iOS simulator and physical devices use your machine's IP
    if (__DEV__) {
        // Use local server for development (192.168.29.93)
        return 'http://192.168.29.93:3000';
    }

    // For production native apps
    return 'https://aerosky-backend-one.vercel.app';
}

export const API_BASE_URL = getApiUrl();

// App Configuration
export const APP_CONFIG = {
    appName: 'AeroSky',
    version: '1.0.0',
    // Add any other app-wide configuration here
};

// For easy debugging
if (__DEV__) {
    console.log('API_BASE_URL:', API_BASE_URL);
}
