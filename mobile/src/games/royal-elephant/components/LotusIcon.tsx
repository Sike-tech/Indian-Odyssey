import React from 'react';
import { Text } from 'react-native';

interface LotusIconProps {
  size?: number;
}

export function LotusIcon({ size = 40 }: LotusIconProps) {
  return (
    <Text style={{ fontSize: size }}>🪷</Text>
  );
}
