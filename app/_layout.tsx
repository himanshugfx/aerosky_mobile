import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../lib/store';

export {
  ErrorBoundary
} from 'expo-router';
import Colors from '../constants/Colors';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsReady(true);
    };
    initAuth();
  }, []);

  // Register for push notifications and set up listeners
  useEffect(() => {
    let cleanupListeners: (() => void) | undefined;

    const initNotifications = async () => {
      try {
        const { registerForPushNotificationsAsync, setupNotificationListeners, getLastNotificationResponse } = await import('../lib/notifications');

        // Register and get push token
        const token = await registerForPushNotificationsAsync();
        if (token) {
          console.log('Push token acquired:', token);
          setPushToken(token);
        }

        // Set up foreground/tap listeners
        cleanupListeners = setupNotificationListeners(
          // onReceived (foreground notification)
          (notification) => {
            const { title, body } = notification.request.content;
            console.log('[Foreground Notification]', title, body);
          },
          // onTapped (user tapped notification)
          (response) => {
            const data = response.notification.request.content.data;
            console.log('[Notification Tapped] Data:', data);
          },
        );

        // Check if app was launched by a notification (cold start)
        const lastResponse = await getLastNotificationResponse();
        if (lastResponse) {
          console.log('[Cold Start Notification]', lastResponse.notification.request.content);
        }
      } catch (err) {
        console.error('Failed to initialize notifications:', err);
      }
    };

    initNotifications();

    return () => {
      cleanupListeners?.();
    };
  }, []);

  // Register push token with backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated && pushToken) {
      import('../lib/api').then(({ apiClient }) => {
        apiClient.post('/api/mobile/auth/push-token', { token: pushToken })
          .then(() => console.log('Push token registered with backend'))
          .catch(err => console.error('Failed to register push token:', err));
      });
    }
  }, [isAuthenticated, pushToken]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isReady, segments]);

  // Custom theme that matches our Colors
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.cardBackground,
      primary: Colors.dark.primary,
      text: Colors.dark.text,
      border: Colors.dark.border,
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      card: Colors.light.cardBackground,
      primary: Colors.light.primary,
      text: Colors.light.text,
      border: Colors.light.border,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="support/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="drone/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
