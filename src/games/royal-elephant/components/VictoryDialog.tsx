import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../../components/ui/Icon';

interface VictoryDialogProps {
  levelNumber: number;
  moves: number;
  parMoves: number;
  allLotusCollected: boolean;
  allCoinsCollected: boolean;
  xpEarned: number;
  coinsEarned: number;
  onNext: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export function VictoryDialog({
  levelNumber,
  moves,
  parMoves,
  allLotusCollected,
  allCoinsCollected,
  xpEarned,
  coinsEarned,
  onNext,
  onRestart,
  onHome,
}: VictoryDialogProps) {
  const stars = allLotusCollected && allCoinsCollected && moves <= parMoves ? 3 : allLotusCollected && moves <= parMoves ? 2 : 1;

  return (
    <View className="absolute inset-0 items-center justify-center bg-black/60 z-50">
      <View className="bg-midnight-900 border border-royal/30 rounded-2xl px-8 py-8 mx-6 items-center shadow-card">
        {/* Title */}
        <Text className="text-royal font-bold text-2xl mb-2">Victory!</Text>
        <Text className="text-royal-100/60 text-sm mb-4">
          Level {levelNumber} Complete
        </Text>

        {/* Stars */}
        <View className="flex-row mb-4">
          {[1, 2, 3].map((i) => (
            <Icon
              key={i}
              name="star"
              size={36}
              color={i <= stars ? '#D4AF37' : '#2A2A3A'}
            />
          ))}
        </View>

        {/* Stats */}
        <View className="flex-row mb-2">
          <Text className="text-royal-100/70 text-sm">Moves: </Text>
          <Text className="text-royal-50 text-sm font-semibold">
            {moves} / {parMoves}
          </Text>
        </View>

        <View className="flex-row mb-2">
          <Icon name="star" size={16} color="#D4AF37" />
          <Text className="text-royal-50 text-sm ml-1 font-semibold">
            +{xpEarned} XP
          </Text>
        </View>

        <View className="flex-row mb-6">
          <Icon name="coin" size={16} color="#D4AF37" />
          <Text className="text-royal-50 text-sm ml-1 font-semibold">
            +{coinsEarned} Coins
          </Text>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onRestart}
            className="bg-midnight-700 border border-royal/20 rounded-xl px-5 py-3"
          >
            <Icon name="restart" size={20} color="#8B9DC3" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onHome}
            className="bg-midnight-700 border border-royal/20 rounded-xl px-5 py-3"
          >
            <Icon name="home" size={20} color="#8B9DC3" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            className="bg-royal border border-royal-400 rounded-xl px-8 py-3"
          >
            <Text className="text-midnight font-bold text-sm">NEXT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
