import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../../components/ui/Icon';

interface HUDProps {
  levelName: string;
  levelNumber: number;
  moves: number;
  parMoves: number;
  lotusTotal: number;
  lotusCollected: number;
  coins: number;
  onHome: () => void;
  onPause: () => void;
}

export function HUD({
  levelName,
  levelNumber,
  moves,
  parMoves,
  lotusTotal,
  lotusCollected,
  coins,
  onHome,
  onPause,
}: HUDProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-2 bg-midnight-900/90 border-b border-royal/20">
      {/* Home */}
      <TouchableOpacity onPress={onHome} className="p-2">
        <Icon name="home" size={24} color="#D4AF37" />
      </TouchableOpacity>

      {/* Level info */}
      <View className="flex-1 items-center">
        <Text className="text-royal-50 font-bold text-sm">
          Level {levelNumber}
        </Text>
        <Text className="text-royal/60 text-xs">{levelName}</Text>
      </View>

      {/* Lotus count */}
      <View className="flex-row items-center mx-3">
        <Icon name="flower" size={16} color="#D4AF37" />
        <Text className="text-royal-50 text-xs ml-1 font-semibold">
          {lotusCollected}/{lotusTotal}
        </Text>
      </View>

      {/* Moves */}
      <View className="flex-row items-center mx-3">
        <Icon name="foot-print" size={16} color="#8B9DC3" />
        <Text className="text-royal-100/70 text-xs ml-1">
          {moves}/{parMoves}
        </Text>
      </View>

      {/* Coins */}
      <View className="flex-row items-center mx-3">
        <Icon name="coin" size={16} color="#D4AF37" />
        <Text className="text-royal-50 text-xs ml-1 font-semibold">
          {coins}
        </Text>
      </View>

      {/* Pause */}
      <TouchableOpacity onPress={onPause} className="p-2">
        <Icon name="pause" size={22} color="#8B9DC3" />
      </TouchableOpacity>
    </View>
  );
}
