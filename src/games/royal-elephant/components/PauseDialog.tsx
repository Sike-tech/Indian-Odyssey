import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../../components/ui/Icon';

interface PauseDialogProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export function PauseDialog({ onResume, onRestart, onHome }: PauseDialogProps) {
  return (
    <View className="absolute inset-0 items-center justify-center bg-black/60 z-50">
      <View className="bg-midnight-900 border border-royal/30 rounded-2xl px-8 py-8 mx-6 items-center shadow-card">
        <Text className="text-royal font-bold text-2xl mb-6">Paused</Text>

        <View className="gap-3 w-full">
          <TouchableOpacity
            onPress={onResume}
            className="bg-royal border border-royal-400 rounded-xl py-3 items-center"
          >
            <Text className="text-midnight font-bold text-sm">RESUME</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onRestart}
            className="bg-midnight-700 border border-royal/20 rounded-xl py-3 items-center"
          >
            <Text className="text-royal-100 text-sm font-semibold">RESTART</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onHome}
            className="bg-midnight-700 border border-royal/20 rounded-xl py-3 items-center"
          >
            <Text className="text-royal-100/70 text-sm">HOME</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
