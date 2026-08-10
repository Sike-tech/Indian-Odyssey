import './global.css';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Asset from 'expo-asset';
import { ProfileProvider } from './src/hooks/useProfile';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

const ASSETS = [
  require('./assets/home-page.png'),
  require('./assets/question-page.png'),
  require('./assets/royal-elephant-game-ui-5x5.png'),
  require('./assets/royal-elephant-game-ui-6x6.png'),
  require('./assets/royal-elephant-game-ui-7x7.png'),
  require('./assets/royal-elephant-game-ui-8x8.png'),
  require('./assets/royal-elephant-levels.png'),
  require('./assets/victory-dialog-0-star.png'),
  require('./assets/victory-dialog-1-star.png'),
  require('./assets/victory-dialog-2-star.png'),
  require('./assets/victory-dialog-3-star.png'),
  require('./assets/Ashok-Chakra.png'),
];

export default function App() {
  const [fontsLoaded] = useFonts({
    'Cinzel-Bold': require('./assets/Cinzel Family/Cinzel/Cinzel-Bold.ttf'),
    'Cinzel': require('./assets/Cinzel Family/Cinzel/Cinzel-Regular.ttf'),
    'Cinzel-Black': require('./assets/Cinzel Family/Cinzel/Cinzel-Black.ttf'),
  });

  useEffect(() => {
    Asset.loadAsync(ASSETS).catch(() => {});
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
