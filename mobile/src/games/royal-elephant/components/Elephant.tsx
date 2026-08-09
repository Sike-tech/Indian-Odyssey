import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Position } from '../types';

interface ElephantProps {
  /** Grid position of the elephant */
  position: Position;
  /** Pixel size of each tile */
  tileSize: number;
  /** Pixel height of each tile (defaults to tileSize) */
  tileHeight?: number;
  /** Pixel width of each tile (defaults to tileSize) */
  tileWidth?: number;
  /** Whether the elephant is selected (showing valid moves) */
  selected: boolean;
}

export function Elephant({ position, tileSize, tileHeight, tileWidth, selected }: ElephantProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Pulse when selected
  useEffect(() => {
    if (selected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [selected]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: position.col * (tileWidth ?? tileSize),
        top: position.row * (tileHeight ?? tileSize),
        width: tileSize,
        height: tileHeight ?? tileSize,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
      }}
    >
      {/* Selection glow */}
      {selected && (
        <Animated.View
          style={{
            position: 'absolute',
            width: tileSize * 0.9,
            height: tileSize * 0.9,
            borderRadius: tileSize * 0.45,
            backgroundColor: 'rgba(70, 130, 220, 0.3)',
            opacity: glowAnim,
          }}
        />
      )}

      {/* Elephant emoji */}
      <Animated.Text
        style={{
          fontSize: tileSize * 0.65,
          transform: [{ scale: scaleAnim }],
        }}
      >
        🐘
      </Animated.Text>
    </Animated.View>
  );
}
