import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, CategoryKey } from '../types';
import { useProfile } from '../hooks/useProfile';
import { CATEGORIES } from '../data/questions';
import { ACHIEVEMENTS } from '../data/achievements';
import { Icon } from '../components/ui/Icon';
import { Card, GoldButton } from '../components/ui';
import Header from '../components/Header';
import RoyalHeroBanner from '../components/RoyalHeroBanner';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 66;

const categoryEntries: { key: CategoryKey | 'mixed'; name: string; icon: string }[] = [
  { key: 'history', name: 'History', icon: 'bank' },
  { key: 'culture', name: 'Culture', icon: 'theater' },
  { key: 'festivals', name: 'Festivals', icon: 'party-popper' },
  { key: 'mythology', name: 'Mythology', icon: 'book-open-page-variant' },
  { key: 'geography', name: 'Geography', icon: 'earth' },
  { key: 'mixed', name: 'Mixed', icon: 'shuffle' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, reset, refresh } = useProfile();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const startGame = (category?: CategoryKey | 'mixed') => {
    navigation.navigate('Quiz', { category });
  };

  const goToAchievements = () => {
    navigation.navigate('Achievements');
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset progress?',
      'All XP, levels and achievements will be lost.',
      [
        { text: 'NO', style: 'cancel' },
        {
          text: 'YES, RESET',
          style: 'destructive',
          onPress: () => reset(),
        },
      ]
    );
  };

  const unlockedCount = profile.achievements.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <LinearGradient
      colors={['#081B3A', '#030914', '#050E1F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Header */}
          <Header profile={profile} />

          {/* Hero Banner */}
          <RoyalHeroBanner />

          {/* Categories */}
          <View className="mt-6 px-5">
            <Text className="text-royal-200 text-base font-bold mb-3 tracking-wide">
              Choose Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 20 }}
            >
              {categoryEntries.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  activeOpacity={0.85}
                  onPress={() => startGame(cat.key)}
                  className="items-center"
                >
                  <LinearGradient
                    colors={['rgba(212,175,55,0.35)', 'rgba(212,175,55,0.08)']}
                    className="rounded-full border border-royal/30 items-center justify-center"
                    style={{
                      width: CIRCLE_SIZE,
                      height: CIRCLE_SIZE,
                      shadowColor: '#D4AF37',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.18,
                      shadowRadius: 10,
                      elevation: 5,
                    }}
                  >
                    <View
                      className="rounded-full bg-midnight-700 items-center justify-center border border-white/5"
                      style={{ width: CIRCLE_SIZE - 8, height: CIRCLE_SIZE - 8 }}
                    >
                      <Icon
                        name={cat.icon}
                        size={cat.key === 'mixed' ? 26 : 24}
                        color={cat.key === 'mixed' ? '#E6C36A' : '#D4AF37'}
                      />
                    </View>
                  </LinearGradient>
                  <Text className="text-royal-200 text-xs font-semibold mt-2 text-center w-16">
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Main Play CTA */}
          <View className="mx-5 mt-6">
            <GoldButton
              title="PLAY QUIZ"
              subtitle="Test Your Knowledge"
              onPress={() => startGame('mixed')}
              className="w-full"
            />
          </View>

          {/* Feature Cards */}
          <View className="mx-5 mt-6 flex-row gap-3">
            <Card
              gradient
              className="flex-1 p-3 items-center justify-center min-h-[86px]"
            >
              <Icon name="trophy" size={24} color="#F8EFD4" />
              <Text className="text-royal-100 text-xs font-bold mt-1.5 tracking-wide">STATS</Text>
              <Text className="text-white/50 text-[10px] mt-0.5">
                {profile.totalCorrect} correct
              </Text>
            </Card>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={goToAchievements}
              className="flex-1"
            >
              <Card
                gradient
                className="flex-1 p-3 items-center justify-center min-h-[86px]"
              >
                <Icon name="shield-star" size={24} color="#F8EFD4" />
                <Text className="text-royal-100 text-xs font-bold mt-1.5 tracking-wide">ACHIEVE</Text>
                <Text className="text-white/50 text-[10px] mt-0.5">
                  {unlockedCount}/{totalAchievements}
                </Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => startGame('mixed')}
              className="flex-1"
            >
              <Card
                gradient
                className="flex-1 p-3 items-center justify-center min-h-[86px]"
              >
                <Icon name="shuffle" size={24} color="#F8EFD4" />
                <Text className="text-royal-100 text-xs font-bold mt-1.5 tracking-wide">PLAY</Text>
                <Text className="text-white/50 text-[10px] mt-0.5">Mixed quiz</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={confirmReset}
              className="flex-1"
            >
              <Card
                gradient
                className="flex-1 p-3 items-center justify-center min-h-[86px]"
              >
                <Icon name="restart" size={24} color="#F8EFD4" />
                <Text className="text-royal-100 text-xs font-bold mt-1.5 tracking-wide">RESET</Text>
                <Text className="text-white/50 text-[10px] mt-0.5">Fresh start</Text>
              </Card>
            </TouchableOpacity>
          </View>

          {/* Streak + Quiz of the Day Row */}
          <View className="mx-5 mt-6 flex-row gap-3">
            <Card className="flex-[38] flex-row items-center px-3 py-3">
              <Icon name="fire" size={20} color="#D4AF37" />
              <View className="ml-2">
                <Text className="text-royal text-[10px] font-bold tracking-wider">STREAK</Text>
                <Text className="text-white/80 text-xs font-semibold">
                  {profile.bestStreak} Days
                </Text>
              </View>
            </Card>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => startGame('mixed')}
              className="flex-[50]"
            >
              <LinearGradient
                colors={['#F8EFD4', '#E6C36A', '#D4AF37', '#B5942A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-[20px] flex-row items-center px-4 py-3 border border-royal-100/40"
                style={{
                  shadowColor: '#D4AF37',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 14,
                  elevation: 8,
                }}
              >
                <View className="flex-1">
                  <Text className="text-midnight-900 text-[10px] font-bold tracking-wider">QUIZ OF THE DAY</Text>
                  <Text className="text-midnight-700 text-xs font-semibold">Play Now</Text>
                </View>
                <Icon name="chevron-right" size={22} color="#081B3A" />
              </LinearGradient>
            </TouchableOpacity>
            <View className="flex-[12] items-center justify-center">
              <Icon name="candle" size={28} color="#E6C36A" />
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
