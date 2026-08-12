import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, ScrollView, View, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useProfile } from '../hooks/useProfile';
import { GoldParticles } from '../components/ui/GoldParticles';

const PNG_WIDTH = 853;
const PNG_HEIGHT = 1844;

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Top bar buttons — currently inactive */
const TOP_BUTTONS = [
  { id: 'profile', x: 56, y: 55, w: 120, h: 120 },
  { id: 'coins', x: 515, y: 68, w: 190, h: 72 },
  { id: 'settings', x: 718, y: 64, w: 85, h: 90 },
];

/** Main game buttons */
const GAME_BUTTONS = [
  { id: 'royal-elephant', x: 36, y: 730, w: 780, h: 225 },
  { id: 'bharat-quiz', x: 36, y: 969, w: 780, h: 225 },
  { id: 'daily-challenge', x: 36, y: 1200, w: 780, h: 225 },
  { id: 'leaderboard', x: 36, y: 1444, w: 780, h: 225 },
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

  const chakraRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      chakraRotation.setValue(0);
      Animated.timing(chakraRotation, {
        toValue: 360,
        duration: 36000,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, []);

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
    zIndex: 10,
  });

  const circleStyle = (x: number, y: number, size: number) => ({
    position: 'absolute' as const,
    left: x * s,
    top: y * s,
    width: size * s,
    height: size * s,
    borderRadius: (size / 2) * s,
    backgroundColor: 'transparent',
    zIndex: 10,
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#081B3A' }} contentContainerStyle={{ minHeight: imgHeight }}>
      <Image
        source={require('../../assets/home-page.png')}
        style={{ width: screenWidth, height: imgHeight }}
      />

      <GoldParticles />

      {/* Hero banner — invisible, blocks particles */}
      <View style={{ position: 'absolute', left: 120 * s, top: 170 * s, width: 610 * s, height: 540 * s, borderRadius: 200 * s, zIndex: 10 }} />

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

      {/* Ashok Chakra — left of Achievements button */}
      <Animated.Image
        source={require('../../assets/Ashok-Chakra.png')}
        style={{
          position: 'absolute',
          left: 100 * s,
          top: 1265 * s,
          width: 150 * s,
          height: 150 * s,
          zIndex: 10,
          transform: [{
            rotate: chakraRotation.interpolate({
              inputRange: [0, 360],
              outputRange: ['0deg', '360deg'],
            }),
          }],
        }}
        resizeMode="contain"
      />

      {/* Nav bar — inactive, circles */}
      {NAV_BUTTONS.map((btn) => (
        <View key={btn.id} style={circleStyle(btn.x, btn.y, btn.w)} />
      ))}
    </ScrollView>
  );
}
