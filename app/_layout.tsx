import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeDatabase } from '@core/db/LedgerDatabase';
import { ServiceLocator } from '@di/providers/ServiceLocator';
import { Colors } from '@core/theme';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('RootLayout');

/**
 * Root layout — initializes SQLite + ServiceLocator before any route renders.
 * Auth guard: redirects to /sign-in when unauthenticated (currently bypassed).
 * Equivalent to Android's Application class + NavHost setup.
 */
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const db = await initializeDatabase();
        ServiceLocator.initialize(db);
        log.info('App initialized successfully');
      } catch (e) {
        log.error('Initialization failed', e);
      } finally {
        if (mounted) setIsReady(true);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        {/* Auth screen */}
        <Stack.Screen
          name="(auth)/sign-in"
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />

        {/* Tab group — renders the main app with bottom navigation */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modal screens — presented over the tab bar */}
        <Stack.Screen
          name="transactions/upsert"
          options={{
            headerShown: true,
            title: 'Transaction',
            presentation: 'modal',
            headerTintColor: Colors.primary,
          }}
        />
        <Stack.Screen
          name="accounts/upsert"
          options={{
            headerShown: true,
            title: 'Account',
            presentation: 'modal',
            headerTintColor: Colors.primary,
          }}
        />
        <Stack.Screen
          name="categories/upsert"
          options={{
            headerShown: true,
            title: 'Category',
            presentation: 'modal',
            headerTintColor: Colors.primary,
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
