import './global.css';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ProfileProvider } from './src/hooks/useProfile';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Cinzel-Bold': require('./assets/fonts/Cinzel Family/Cinzel/Cinzel-Bold.ttf'),
    'Cinzel': require('./assets/fonts/Cinzel Family/Cinzel/Cinzel-Regular.ttf'),
    'Cinzel-Black': require('./assets/fonts/Cinzel Family/Cinzel/Cinzel-Black.ttf'),
    'Eaglore': require('./assets/fonts/eaglore/Eaglore.otf'),
    'Eroded': require('./assets/fonts/eroded-personal-use/ERODED PERSONAL USE.ttf'),
    'Gomarice': require('./assets/fonts/gomarice/gomarice_tall_block.ttf'),
  });

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
