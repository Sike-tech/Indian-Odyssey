import React, { useCallback } from 'react';
import { View, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useProfile } from '../hooks/useProfile';

const PNG_WIDTH = 853;
const PNG_HEIGHT = 1844;

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Top bar buttons — currently inactive */
const TOP_BUTTONS = [
  { id: 'profile', x: 53, y: 49, w: 120, h: 120 },
  { id: 'coins', x: 515, y: 68, w: 190, h: 72 },
  { id: 'settings', x: 718, y: 64, w: 85, h: 90 },
];

/** Main game buttons */
const GAME_BUTTONS = [
  { id: 'royal-elephant', x: 36, y: 690, w: 780, h: 225 },
  { id: 'bharat-quiz', x: 36, y: 945, w: 780, h: 225 },
  { id: 'daily-challenge', x: 36, y: 1187, w: 780, h: 225 },
  { id: 'leaderboard', x: 36, y: 1434, w: 780, h: 225 },
];

/** Bottom nav buttons — currently inactive */
const NAV_BUTTONS = [
  { id: 'nav-home', x: 87, y: 1698, w: 120, h: 120 },
  { id: 'nav-questions', x: 269, y: 1698, w: 120, h: 120 },
  { id: 'nav-leaderboard', x: 465, y: 1698, w: 120, h: 120 },
  { id: 'nav-profile', x: 649, y: 1698, w: 120, h: 120 },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { refresh } = useProfile();
  const { width: screenWidth } = useWindowDimensions();
  const imgHeight = Math.round(screenWidth * (PNG_HEIGHT / PNG_WIDTH));
  const s = screenWidth / PNG_WIDTH;

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleGamePress = (id: string) => {
    if (id === 'royal-elephant') {
      navigation.navigate('LevelSelect');
    } else if (id === 'bharat-quiz') {
      navigation.navigate('Quiz', { category: 'mixed' });
    } else if (id === 'daily-challenge') {
      navigation.navigate('Quiz', { category: 'mixed' });
    } else if (id === 'leaderboard') {
      navigation.navigate('Achievements');
    }
  };

  const hitStyle = (x: number, y: number, w: number, h: number, round = false) => ({
    position: 'absolute' as const,
    left: x * s,
    top: y * s,
    width: w * s,
    height: h * s,
    borderRadius: round ? (h / 2) * s : 0,
    backgroundColor: 'transparent',
  });

  const circleStyle = (x: number, y: number, size: number) => ({
    position: 'absolute' as const,
    left: x * s,
    top: y * s,
    width: size * s,
    height: size * s,
    borderRadius: (size / 2) * s,
    backgroundColor: 'transparent',
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#081B3A' }}>
      <Image
        source={require('../../assets/home-page.png')}
        style={{ width: screenWidth, height: imgHeight }}
      />

      {/* Top bar — inactive */}
      {TOP_BUTTONS.map((btn) => (
        <View key={btn.id} style={hitStyle(btn.x, btn.y, btn.w, btn.h)} />
      ))}

      {/* Game buttons — active, capsule */}
      {GAME_BUTTONS.map((btn) => (
        <TouchableOpacity
          key={btn.id}
          activeOpacity={1}
          onPress={() => handleGamePress(btn.id)}
          style={hitStyle(btn.x, btn.y, btn.w, btn.h, true)}
        />
      ))}

      {/* Nav bar — inactive, circles */}
      {NAV_BUTTONS.map((btn) => (
        <View key={btn.id} style={circleStyle(btn.x, btn.y, btn.w)} />
      ))}
    </View>
  );
}
