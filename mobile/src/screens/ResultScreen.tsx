import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, CategoryKey, SessionSummary } from '../types';
import { useProfile } from '../hooks/useProfile';
import { getAchievement } from '../data/achievements';
import { titleForLevel } from '../data/achievements';
import { Icon } from '../components/ui/Icon';
import { Card, GoldButton, ProgressBar } from '../components/ui';

type ResultRoute = RouteProp<RootStackParamList, 'Result'>;
type ResultNav = NativeStackNavigationProp<RootStackParamList>;

export default function ResultScreen() {
  const navigation = useNavigation<ResultNav>();
  const route = useRoute<ResultRoute>();
  const { profile } = useProfile();

  const summary: SessionSummary | null = route.params?.summary ?? null;
  const newBadgeIds = route.params?.newBadges ?? [];
  const newBadges = newBadgeIds.map((id) => getAchievement(id));

  const playAgain = () => {
    const cat: CategoryKey | 'mixed' | undefined =
      summary?.category === 'mixed' ? 'mixed' : summary?.category;
    navigation.replace('Quiz', { category: cat });
  };

  const goHome = () => {
    navigation.replace('Home');
  };

  if (!summary) {
    return (
      <LinearGradient
        colors={['#081B3A', '#030914']}
        className="flex-1 items-center justify-center"
      >
        <Text className="text-white/80 text-base">No result data</Text>
        <TouchableOpacity onPress={goHome} className="mt-4 px-6 py-3 rounded-2xl bg-royal">
          <Text className="text-midnight-900 font-bold">GO HOME</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const { into, needed } = profile.xpProgress();

  return (
    <LinearGradient
      colors={['#081B3A', '#030914']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-royal-100 text-center text-3xl font-extrabold tracking-[3px]" style={{ fontFamily: 'Georgia' }}>
            Quiz Complete!
          </Text>
          {summary.perfect ? (
            <Text className="text-royal text-base font-bold text-center mt-2 tracking-wider">
              FLAWLESS VICTORY! No wrong answers!
            </Text>
          ) : null}

          <Text className="text-white text-4xl font-bold text-center mt-4">
            {summary.correct} / {summary.total}
          </Text>
          <Text className="text-white/50 text-sm text-center mt-1 tracking-wide uppercase">correct</Text>

          <Card className="mt-6 p-5 rounded-[24px]">
            <Text className="text-royal-100 text-xl font-bold" style={{ fontFamily: 'Georgia' }}>
              +{summary.xpEarned} XP earned
            </Text>
            <Text className="text-royal-100 text-xl font-bold mt-2" style={{ fontFamily: 'Georgia' }}>
              +{summary.coinsEarned} Coins earned
            </Text>
            <Text className="text-white/80 text-sm mt-2">
              Best streak this game: {summary.bestStreak}
            </Text>
            <Text className="text-white/80 text-sm mt-1">
              Level {profile.level} ({profile.title}) · {into}/{needed} XP
            </Text>
            <ProgressBar value={into} max={needed} height={8} className="mt-3" />
          </Card>

          {summary.levelUps.length > 0 ? (
            <Card gradient className="mt-4 p-4 items-center rounded-[24px] border border-royal/30">
              <Icon name="crown" size={28} color="#F8EFD4" />
              <Text className="text-royal-100 text-base font-bold text-center mt-2 tracking-wide">
                CONGRATULATIONS!
              </Text>
              <Text className="text-white/80 text-sm text-center mt-1">
                You are now Level {summary.levelUps[summary.levelUps.length - 1]} - '
                {titleForLevel(summary.levelUps[summary.levelUps.length - 1])}'
              </Text>
            </Card>
          ) : null}

          {newBadges.length > 0 ? (
            <View className="mt-6">
              <Text className="text-royal-200 text-base font-bold mb-3 tracking-wide">
                New Achievements
              </Text>
              {newBadges.map((badge) => (
                <Card
                  key={badge.id}
                  className="flex-row items-center p-3 mb-2 rounded-[20px]"
                >
                  <View className="w-11 h-11 rounded-full bg-royal/15 items-center justify-center border border-royal/20">
                    <Icon name={badge.icon} size={22} color="#F8EFD4" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-royal-100 text-sm font-bold">
                      {badge.name}
                    </Text>
                    <Text className="text-white/60 text-xs mt-0.5">
                      {badge.description}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}

          <View className="mt-8 space-y-3">
            <GoldButton title="PLAY AGAIN" onPress={playAgain} />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={goHome}
              className="py-3 items-center"
            >
              <Text className="text-royal font-bold tracking-wider">HOME</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
