import './global.css';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ProfileProvider } from './src/hooks/useProfile';
import AppNavigator from './src/navigation/AppNavigator';
import { preloadAssets } from './src/core/preload';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Cinzel-Bold': require('./assets/Cinzel Family/Cinzel/Cinzel-Bold.ttf'),
    'Cinzel': require('./assets/Cinzel Family/Cinzel/Cinzel-Regular.ttf'),
    'Cinzel-Black': require('./assets/Cinzel Family/Cinzel/Cinzel-Black.ttf'),
  });

  useEffect(() => {
    preloadAssets();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </ProfileProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});
