import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../../components/ui/Icon';

interface BottomBarProps {
  canUndo: boolean;
  onRestart: () => void;
  onUndo: () => void;
  onHint: () => void;
}

export function BottomBar({ canUndo, onRestart, onUndo, onHint }: BottomBarProps) {
  return (
    <View className="flex-row items-center justify-around px-4 py-3 bg-midnight-900/90 border-t border-royal/20">
      {/* Restart */}
      <TouchableOpacity onPress={onRestart} className="items-center">
        <Icon name="restart" size={24} color="#D4AF37" />
        <Text className="text-royal/60 text-xs mt-1">Restart</Text>
      </TouchableOpacity>

      {/* Hint */}
      <TouchableOpacity onPress={onHint} className="items-center">
        <Icon name="lightbulb-outline" size={24} color="#D4AF37" />
        <Text className="text-royal/60 text-xs mt-1">Hint</Text>
      </TouchableOpacity>

      {/* Undo */}
      <TouchableOpacity
        onPress={onUndo}
        disabled={!canUndo}
        className="items-center"
      >
        <Icon
          name="undo"
          size={24}
          color={canUndo ? '#D4AF37' : '#3D3D3D'}
        />
        <Text className={`text-xs mt-1 ${canUndo ? 'text-royal/60' : 'text-royal/20'}`}>
          Undo
        </Text>
      </TouchableOpacity>
    </View>
  );
}
