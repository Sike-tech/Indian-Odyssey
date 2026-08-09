import React from 'react';
import {
  MaterialCommunityIcons,
  type MaterialCommunityIcons as MCIType,
} from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export function Icon({ name, size = 24, color = '#E6C36A', className }: IconProps) {
  // Most KivyMD icon names map directly to MaterialCommunityIcons.
  return (
    <MaterialCommunityIcons
      name={name as IconName}
      size={size}
      color={color}
      className={className}
    />
  );
}
