import './global.css';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from './src/hooks/useProfile';
import AppNavigator from './src/navigation/AppNavigator';
import OrnamentalBorder from './src/components/OrnamentalBorder';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <View style={styles.container}>
          <AppNavigator />
          <OrnamentalBorder />
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
