import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';

import RootNavigator    from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { Colors }       from './src/theme';

// Keep splash visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  // Initialize auth session on mount
  useEffect(() => { initialize(); }, [initialize]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.root} onLayout={onLayoutRootView}>
          <StatusBar style="light" backgroundColor={Colors.background} />
          <RootNavigator />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
});
