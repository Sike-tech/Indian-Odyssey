import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from './ui/Icon';
import { PlayerProfile } from '../core/player';

interface HeaderProps {
  profile: PlayerProfile;
  onSettings?: () => void;
}

export default function Header({ profile, onSettings }: HeaderProps) {
  const { into, needed } = profile.xpProgress();
  const shineAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [shineAnim]);

  const shineTranslate = shineAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-80, 220],
  });

  const IconButton = ({
    name,
    value,
    onPress,
  }: {
    name: string;
    value?: number | string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="items-center justify-center"
      style={{ marginLeft: 12 }}
    >
      <View
        className="w-[42px] h-[42px] rounded-full items-center justify-center"
        style={{
          backgroundColor: '#081B3A',
          borderWidth: 1.5,
          borderColor: 'rgba(212, 175, 55, 0.65)',
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* inner shadow ring */}
        <View
          className="absolute inset-[1px] rounded-full border border-white/5"
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.45,
            shadowRadius: 4,
          }}
        />
        <Icon name={name} size={20} color="#D4AF37" />
      </View>
      {value !== undefined ? (
        <Text className="text-royal-100 text-[10px] font-bold mt-1 tracking-wide">
          {value}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View className="flex-row items-center px-5 pt-3 pb-2">
      {/* Avatar with double gold ring + glow */}
      <View
        className="items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          borderWidth: 2,
          borderColor: '#D4AF37',
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
          elevation: 8,
        }}
      >
        <View
          className="items-center justify-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: 'rgba(212, 175, 55, 0.55)',
            backgroundColor: '#081B3A',
          }}
        >
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 38, height: 38, backgroundColor: 'rgba(212,175,55,0.10)' }}
          >
            <Icon name="account" size={22} color="#D4AF37" />
          </View>
        </View>
      </View>

      {/* Level + XP capsule */}
      <View className="ml-3.5 flex-1">
        <Text className="text-royal-100 font-bold text-sm tracking-wide">
          {profile.title} <Text className="text-royal-300">· Level {profile.level}</Text>
        </Text>
        <View
          className="mt-2 rounded-full overflow-hidden border border-royal/20 bg-midnight-800"
          style={{ height: 12, padding: 2 }}
        >
          <View className="flex-1 rounded-full bg-midnight-700 overflow-hidden">
            <View
              className="h-full rounded-full overflow-hidden"
              style={{ width: `${needed > 0 ? (into / needed) * 100 : 0}%` }}
            >
              <LinearGradient
                colors={['#F8EFD4', '#E6C36A', '#D4AF37', '#B5942A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-1"
              />
              <Animated.View
                className="absolute top-0 bottom-0 w-14"
                style={{
                  transform: [{ translateX: shineTranslate }],
                  backgroundColor: 'rgba(255,255,255,0.4)',
                }}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Right icon cluster */}
      <View className="flex-row items-center ml-3">
        <IconButton name="fire" value={profile.bestStreak} />
        <IconButton name="currency-inr" value={profile.totalXp} />
        <IconButton name="cog" onPress={onSettings} />
      </View>
    </View>
  );
}
