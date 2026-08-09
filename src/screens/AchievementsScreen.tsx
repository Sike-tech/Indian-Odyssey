import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { useProfile } from '../hooks/useProfile';
import { ACHIEVEMENTS } from '../data/achievements';
import { Icon } from '../components/ui/Icon';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 2;
const COLORS = [
  '#D4AF37', '#E6C36A', '#F8EFD4', '#B5942A',
  '#66BB6A', '#26A69A', '#8D6E63', '#AB47BC',
  '#FF8A65', '#5C6BC0', '#29B6F6', '#FFCA28',
  '#FFD54F', '#4CAF50', '#2E7D32', '#42A5F5',
];

function FlipCard({
  achievement,
  unlocked,
  color,
}: {
  achievement: typeof ACHIEVEMENTS[0];
  unlocked: boolean;
  color: string;
}) {
  const rotation = useSharedValue(0);
  const [showBack, setShowBack] = useState(false);

  const toggle = () => {
    setShowBack(!showBack);
    rotation.value = withTiming(showBack ? 0 : 180, { duration: 280 });
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${rotation.value}deg` },
    ],
    opacity: interpolate(rotation.value, [0, 90, 180], [1, 0, 0]),
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${rotation.value + 180}deg` },
    ],
    opacity: interpolate(rotation.value, [0, 90, 180], [0, 0, 1]),
    backfaceVisibility: 'hidden',
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={toggle}
      style={{ width: CARD_WIDTH, height: 180, marginBottom: 14 }}
    >
      {/* Front */}
      <Animated.View
        style={[frontStyle, { position: 'absolute', width: CARD_WIDTH, height: 180 }]}
        className="rounded-[22px] border border-royal/15 overflow-hidden shadow-card"
      >
        <LinearGradient
          colors={['#0F2444', '#081B3A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 items-center justify-center px-3"
        >
          <View
            className="w-16 h-16 rounded-full items-center justify-center border-2"
            style={{
              borderColor: unlocked ? color : '#3A4250',
              backgroundColor: unlocked ? `${color}18` : '#0F2444',
              shadowColor: unlocked ? color : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: unlocked ? 6 : 0,
            }}
          >
            <Icon
              name={unlocked ? achievement.icon : 'lock-outline'}
              size={28}
              color={unlocked ? color : '#3A4250'}
            />
          </View>
          <Text className="text-royal-100 text-center text-xs font-bold mt-3 leading-4" numberOfLines={2}>
            {achievement.name}
          </Text>
          <Text
            className={[
              'text-[10px] font-semibold mt-1.5 tracking-wide',
              unlocked ? 'text-green-400' : 'text-white/40',
            ].join(' ')}
          >
            {unlocked ? 'Completed' : 'Locked'}
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Back */}
      <Animated.View
        style={[backStyle, { position: 'absolute', width: CARD_WIDTH, height: 180 }]}
        className="rounded-[22px] border border-royal/15 overflow-hidden shadow-card"
      >
        <LinearGradient
          colors={['#132A4C', '#0B1E3A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 items-center justify-center px-4"
        >
          <Text className="text-royal-100 text-center text-sm font-bold" style={{ fontFamily: 'Georgia' }}>
            {achievement.name}
          </Text>
          <Text className="text-white/70 text-center text-xs mt-2 leading-4">
            {achievement.description}
          </Text>
          <Text className="text-royal-300/80 text-[10px] mt-3 font-semibold tracking-wider">
            {unlocked ? 'Unlocked' : 'Locked'}
          </Text>
          <Text className="text-white/25 text-[10px] mt-1">tap to close</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function AchievementsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useProfile();
  const unlocked = new Set(profile.achievements);

  return (
    <LinearGradient
      colors={['#081B3A', '#030914']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-3 pb-4">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            className="flex-row items-center"
          >
            <Icon name="arrow-left" size={24} color="#D4AF37" />
            <Text className="text-royal font-bold text-sm ml-1 tracking-wide">BACK</Text>
          </TouchableOpacity>
          <Text className="text-royal-100 text-xl font-bold ml-4 flex-1" style={{ fontFamily: 'Georgia' }}>
            Achievements
          </Text>
          <Text className="text-white/60 text-xs font-semibold">
            {unlocked.size}/{ACHIEVEMENTS.length}
          </Text>
        </View>

        {/* Grid */}
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap justify-between">
            {ACHIEVEMENTS.map((a, i) => (
              <FlipCard
                key={a.id}
                achievement={a}
                unlocked={unlocked.has(a.id)}
                color={COLORS[i % COLORS.length]}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
