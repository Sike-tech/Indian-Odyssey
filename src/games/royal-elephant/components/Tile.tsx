import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Position, TileType, ItemType } from '../types';
import { LotusIcon } from './LotusIcon';

interface TileProps {
  /** Grid position */
  position: Position;
  /** Pixel size of the tile */
  tileSize: number;
  /** Pixel height of the tile (defaults to tileSize) */
  tileHeight?: number;
  /** Pixel width of the tile (defaults to tileSize) */
  tileWidth?: number;
  /** Whether this tile is a valid move destination */
  isValidMove: boolean;
  /** Is this tile selected as hint? */
  isHint: boolean;
  /** Terrain type */
  terrain: TileType;
  /** Item on this tile (if any) */
  item?: ItemType;
  /** Is this the exit tile? */
  isExit: boolean;
  /** Is this the player tile? */
  isPlayer: boolean;
  /** Is this a guard tile? */
  isGuard: boolean;
  /** Was this lotus already collected? */
  lotusCollected: boolean;
  /** Was this coin already collected? */
  coinCollected: boolean;
  /** Trigger lock opening animation */
  gateOpening?: boolean;
  /** Callback when tile is pressed */
  onPress: () => void;
}

/** Background colors for terrain */
const TERRAIN_BG: Record<TileType, string> = {
  empty: 'transparent',
  water: 'rgba(30, 80, 160, 0.5)',
  rock: 'rgba(100, 80, 60, 0.5)',
  tree: 'rgba(30, 100, 30, 0.4)',
  wall: 'rgba(80, 60, 40, 0.8)',
  locked_gate: 'rgba(180, 140, 40, 0.5)',
  guard: 'transparent',
};

const TERRAIN_BORDER: Record<TileType, string> = {
  empty: 'rgba(212, 175, 55, 0.08)',
  water: 'rgba(70, 130, 220, 0.3)',
  rock: 'rgba(140, 120, 80, 0.4)',
  tree: 'rgba(60, 140, 60, 0.3)',
  wall: 'rgba(120, 90, 50, 0.6)',
  locked_gate: 'rgba(212, 175, 55, 0.6)',
  guard: 'transparent',
};

const TERRAIN_ICON: Record<TileType, string> = {
  empty: '',
  water: '🌊',
  rock: '🪨',
  tree: '🌳',
  wall: '🧱',
  locked_gate: '🔒',
  guard: '',
};

export function Tile({
  position,
  tileSize,
  tileHeight,
  tileWidth,
  isValidMove,
  isHint,
  terrain,
  item,
  isExit,
  isPlayer,
  isGuard,
  lotusCollected,
  coinCollected,
  gateOpening,
  onPress,
}: TileProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lockShake = useRef(new Animated.Value(0)).current;
  const lockFade = useRef(new Animated.Value(1)).current;
  const [lockGone, setLockGone] = useState(false);

  // Pulse valid move tiles
  useEffect(() => {
    if (isValidMove) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.5, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isValidMove]);

  // Lock opening animation
  useEffect(() => {
    if (gateOpening && terrain === 'locked_gate' && !lockGone) {
      Animated.sequence([
        // Shake 1
        Animated.sequence([
          Animated.timing(lockShake, { toValue: 6, duration: 50, useNativeDriver: true }),
          Animated.timing(lockShake, { toValue: -6, duration: 50, useNativeDriver: true }),
        ]),
        // Shake 2
        Animated.sequence([
          Animated.timing(lockShake, { toValue: 6, duration: 50, useNativeDriver: true }),
          Animated.timing(lockShake, { toValue: -6, duration: 50, useNativeDriver: true }),
        ]),
        Animated.timing(lockShake, { toValue: 0, duration: 50, useNativeDriver: true }),
        // Fade out
        Animated.timing(lockFade, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => setLockGone(true));
    }
  }, [gateOpening]);

  const bg = TERRAIN_BG[terrain];
  const border = TERRAIN_BORDER[terrain];

  return (
    <TouchableOpacity
      activeOpacity={isValidMove || isPlayer ? 0.7 : 1}
      onPress={onPress}
      disabled={!isValidMove && !isPlayer}
      style={{
        width: tileWidth ?? tileSize,
        height: tileHeight ?? tileSize,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
      }}
    >
      {/* Valid move indicator */}
      {isValidMove && (
        <Animated.View
          style={{
            position: 'absolute',
            width: tileSize * 0.45,
            height: tileSize * 0.45,
            borderRadius: tileSize * 0.225,
            backgroundColor: 'rgba(70, 160, 255, 0.45)',
            borderWidth: 2,
            borderColor: 'rgba(100, 180, 255, 0.7)',
            opacity: pulseAnim,
            shadowColor: '#4488FF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: 4,
          }}
        />
      )}

      {/* Terrain icon */}
      {terrain !== 'empty' && terrain !== 'guard' && !(terrain === 'locked_gate' && lockGone) && (
        <Animated.Text style={{
          fontSize: tileSize * 0.45,
          opacity: terrain === 'locked_gate' ? lockFade : 1,
          transform: terrain === 'locked_gate' ? [{ translateX: lockShake }] : [],
        }}>
          {TERRAIN_ICON[terrain]}
        </Animated.Text>
      )}

      {/* Lotus */}
      {item === 'lotus' && !lotusCollected && (
        <LotusIcon size={tileSize * 0.45} />
      )}

      {/* Coin */}
      {item === 'coin' && !coinCollected && (
        <Text style={{ fontSize: tileSize * 0.4, zIndex: 5 }}>🪙</Text>
      )}

      {/* Exit */}
      {isExit && (
        <Text style={{ fontSize: tileSize * 0.35, zIndex: 5 }}>🏛️</Text>
      )}

      {/* Guard */}
      {isGuard && (
        <Text style={{ fontSize: tileSize * 0.45, zIndex: 15 }}>⚔️</Text>
      )}

      {/* Hint indicator */}
      {isHint && (
        <View
          style={{
            position: 'absolute',
            width: tileSize * 0.85,
            height: tileSize * 0.85,
            borderRadius: tileSize * 0.1,
            borderWidth: 2,
            borderColor: 'rgba(212, 175, 55, 0.8)',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
          }}
        />
      )}
    </TouchableOpacity>
  );
}
