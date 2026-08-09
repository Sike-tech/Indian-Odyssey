import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, useWindowDimensions, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useProfile } from '../../../hooks/useProfile';
import {
  loadLevelProgress,
  saveLevelProgress,
  LevelProgressMap,
} from '../../../core/storage';
import {
  GameState,
  Position,
} from '../types';
import {
  createGameState,
  selectElephant,
  deselectElephant,
  moveElephant,
  undoMove,
  advanceGuards,
  computeValidMoves,
  getLevel,
  getLevels,
  calculateXpForStars,
  calculateCoinsForStars,
  calculateStars,
} from '../engine';
import { HUD } from '../components/HUD';
import { BottomBar } from '../components/BottomBar';
import { GameBoard } from '../components/GameBoard';
import { VictoryDialog } from '../components/VictoryDialog';
import { PauseDialog } from '../components/PauseDialog';

const BG_WIDTH = 420;
const BG_HEIGHT = 900;

// Per-grid-size positioning — adjust these to match each PNG
const gridStyles: Record<number, {
  container: { top: number; left?: number; right?: number; alignItems?: string };
  tileHeightFactor: number;
  tileWidthFactor: number;
}> = {
  5: {
    container: { top: 264, left: -3, right: 0, alignItems: 'center' },
    tileHeightFactor: 1.08,
    tileWidthFactor: 0.94,
  },
  6: {
    container: { top: 270, left: -1, right: 0, alignItems: 'center' },
    tileHeightFactor: 1.063,
    tileWidthFactor: 0.93,
  },
  7: {
    container: { top: 264, left: 2, right: 0, alignItems: 'center' },
    tileHeightFactor: 1.08,
    tileWidthFactor: 0.923,
  },
  8: {
    container: { top: 265, left: 10, right: 0, alignItems: 'center' },
    tileHeightFactor: 1.03,
    tileWidthFactor: 0.95,
  },
};

// Per-grid tip positioning
const tipPositions: Record<number, { bottom: number; left: number; right: number; fontSize: number }> = {
  5: { bottom: 152, left: 35, right: 35, fontSize: 12 },
  6: { bottom: 157, left: 35, right: 35, fontSize: 12 },
  7: { bottom: 155, left: 35, right: 35, fontSize: 12 },
  8: { bottom: 152, left: 35, right: 35, fontSize: 12 },
};

// Per-grid HUD positioning (top stats + bottom buttons)
const hudPositions: Record<number, {
  lotus: { top: number; left: number };
  steps: { top: number; left: number };
  coins: { top: number; right: number; width: number };
  restart: { bottom: number; left: number };
  hint: { bottom: number; left: number };
  undo: { bottom: number; right: number };
}> = {
  5: {
    lotus: { top: 200, left: 85 },
    steps: { top: 200, left: 194 },
    coins: { top: 200, right: 36, width: 60 },
    restart: { bottom: 30, left: 43 },
    hint: { bottom: 30, left: 168 },
    undo: { bottom: 30, right: 48 },
  },
  6: {
    lotus: { top: 200, left: 85 },
    steps: { top: 200, left: 194 },
    coins: { top: 200, right: 36, width: 60 },
    restart: { bottom: 30, left: 43 },
    hint: { bottom: 30, left: 168 },
    undo: { bottom: 30, right: 48 },
  },
  7: {
    lotus: { top: 200, left: 85 },
    steps: { top: 200, left: 194 },
    coins: { top: 200, right: 36, width: 60 },
    restart: { bottom: 30, left: 43 },
    hint: { bottom: 30, left: 168 },
    undo: { bottom: 30, right: 48 },
  },
  8: {
    lotus: { top: 200, left: 85 },
    steps: { top: 200, left: 190 },
    coins: { top: 200, right: 38, width: 60 },
    restart: { bottom: 30, left: 43 },
    hint: { bottom: 30, left: 168 },
    undo: { bottom: 30, right: 48 },
  },
};

type RoyalElephantRoute = RouteProp<RootStackParamList, 'RoyalElephant'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RoyalElephantScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RoyalElephantRoute>();
  const { profile, save, refresh } = useProfile();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const startLevel = route.params?.level ?? 1;
  const [currentLevelIndex, setCurrentLevelIndex] = useState(startLevel - 1);

  const level = getLevel(currentLevelIndex);
  const [gameState, setGameState] = useState<GameState>(() => createGameState(level));
  const [showPause, setShowPause] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [hintTile, setHintTile] = useState<Position | undefined>();
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [levelProgress, setLevelProgress] = useState<LevelProgressMap>({});
  const [gateOpening, setGateOpening] = useState(false);
  const guardTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scale factor for design-space → screen (420×900 reference)
  const s = screenWidth / BG_WIDTH;

  // Calculate tile size to fit the screen
  const maxBoardWidth = screenWidth - 32;
  const maxBoardHeight = screenHeight - 340; // HUD + bottom bar
  const tileSize = Math.floor(
    Math.min(maxBoardWidth / level.cols, maxBoardHeight / level.rows, 80 * s),
  );
  const tileWidth = tileSize;
  const tileHeight = Math.floor(tileSize * 0.8);

  // Guard movement timer
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (guardTimerRef.current) clearInterval(guardTimerRef.current);
      return;
    }

    if (level.guards && level.guards.length > 0) {
      const fastest = Math.min(...level.guards.map((g) => g.speed));
      guardTimerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (prev.status !== 'playing') return prev;
          return advanceGuards(prev);
        });
      }, fastest);
    }

    return () => {
      if (guardTimerRef.current) clearInterval(guardTimerRef.current);
    };
  }, [gameState.status, level]);

  // Guard caught player — reset to start after a brief delay
  useEffect(() => {
    if (gameState.status === 'paused') {
      if (guardTimerRef.current) clearInterval(guardTimerRef.current);
      const timer = setTimeout(() => {
        setGateOpening(false);
        setGameState(createGameState(level));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, level]);

  // Load level progress on mount
  useEffect(() => {
    loadLevelProgress().then(setLevelProgress);
  }, []);

  // Detect when all lotuses collected — trigger gate opening animation
  useEffect(() => {
    const allCollected = gameState.collectedLotus.length === level.lotus.length;
    if (allCollected && level.lockedGates.length > 0 && !gateOpening) {
      setGateOpening(true);
    }
  }, [gameState.collectedLotus.length, level.lotus.length, level.lockedGates.length]);

  // Handle tile press
  const handleTilePress = useCallback(
    (row: number, col: number) => {
      if (gameState.status !== 'playing') return;

      setHintTile(undefined);

      // If player is on this tile, select/deselect
      if (row === gameState.player.row && col === gameState.player.col) {
        if (gameState.selected) {
          setGameState(deselectElephant(gameState));
        } else {
          setGameState(selectElephant(gameState));
        }
        return;
      }

      // If elephant is selected and this is a valid move, move
      if (gameState.selected) {
        const target: Position = { row, col };
        const isValid = gameState.validMoves.some(
          (v) => v.row === row && v.col === col,
        );
        if (isValid) {
          const newState = moveElephant(gameState, target);
          setGameState(newState);

          // Check win
          if (newState.status === 'won') {
            const stars = calculateStars(level, newState.moves, newState.collectedLotus.length, newState.collectedCoins.length);
            const oldStars = levelProgress[level.id]?.stars ?? 0;
            const xp = calculateXpForStars(stars, oldStars);
            const coins = calculateCoinsForStars(stars, oldStars);
            setXpEarned(xp);
            setCoinsEarned(coins);
            setStarsEarned(stars);

            // Award XP and coins
            profile.addXp(xp);
            profile.addCoins(coins);

            // Save level progress — load fresh from storage to avoid stale closure
            save().then(() => {
              loadLevelProgress().then((saved) => {
                const newProgress = { ...saved };
                const existing = newProgress[level.id];
                newProgress[level.id] = {
                  stars: existing ? Math.max(existing.stars, stars) : stars,
                  bestMoves: existing ? Math.min(existing.bestMoves, newState.moves) : newState.moves,
                };
                setLevelProgress(newProgress);
                saveLevelProgress(newProgress).then(() => {
                  refresh();
                  setShowVictory(true);
                });
              });
            });
          }
        } else {
          setGameState(deselectElephant(gameState));
        }
      } else {
        // Tap on empty tile — deselect
        setGameState(deselectElephant(gameState));
      }
    },
    [gameState, level, profile, save, refresh],
  );

  // Hint: find a valid move that collects the nearest lotus
  const handleHint = useCallback(() => {
    if (gameState.status !== 'playing') return;
    const validMoves = computeValidMoves(gameState);
    if (validMoves.length === 0) {
      Alert.alert('No Moves', 'No valid moves available. Try restarting.');
      return;
    }

    // Find nearest uncollected lotus
    const uncollected = level.lotus.filter(
      (l) => !gameState.collectedLotus.some((c) => c.row === l.row && c.col === l.col),
    );

    if (uncollected.length > 0) {
      const target = uncollected[0];
      // Find the valid move closest to the target
      const best = validMoves.reduce((closest, move) => {
        const dist = Math.abs(move.row - target.row) + Math.abs(move.col - target.col);
        const closestDist =
          Math.abs(closest.row - target.row) + Math.abs(closest.col - target.col);
        return dist < closestDist ? move : closest;
      });
      setHintTile(best);
    } else {
      // All lotus collected, hint toward exit
      const best = validMoves.reduce((closest, move) => {
        const dist =
          Math.abs(move.row - level.exit.row) + Math.abs(move.col - level.exit.col);
        const closestDist =
          Math.abs(closest.row - level.exit.row) +
          Math.abs(closest.col - level.exit.col);
        return dist < closestDist ? move : closest;
      });
      setHintTile(best);
    }

    // Clear hint after 3 seconds
    setTimeout(() => setHintTile(undefined), 3000);
  }, [gameState, level]);

  // Restart level
  const handleRestart = useCallback(() => {
    setShowPause(false);
    setShowVictory(false);
    setHintTile(undefined);
    setGateOpening(false);
    setGameState(createGameState(getLevel(currentLevelIndex)));
  }, [currentLevelIndex]);

  // Undo move
  const handleUndo = useCallback(() => {
    if (gameState.moves === 0) return;
    setHintTile(undefined);
    const restored = undoMove(gameState);
    if (restored) setGameState(restored);
  }, [gameState]);

  // Next level
  const handleNextLevel = useCallback(() => {
    setShowVictory(false);
    setGateOpening(false);
    const nextIdx = currentLevelIndex + 1;
    if (nextIdx < getLevels().length) {
      setCurrentLevelIndex(nextIdx);
      setGameState(createGameState(getLevel(nextIdx)));
    } else {
      Alert.alert('Congratulations!', 'You completed all levels!');
      navigation.replace('LevelSelect');
    }
  }, [currentLevelIndex, navigation]);

  // Go to level select
  const handleHome = useCallback(() => {
    if (guardTimerRef.current) clearInterval(guardTimerRef.current);
    navigation.replace('LevelSelect');
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: '#081B3A' }}>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Container: PNG drives height, components overlay on top */}
        <View style={{ width: screenWidth, position: 'relative' }}>
          <Image
            source={
              level.rows === 5
                ? require('../../../../assets/royal-elephant-game-ui-5x5.png')
                : level.rows === 6
                ? require('../../../../assets/royal-elephant-game-ui-6x6.png')
                : level.rows === 7
                ? require('../../../../assets/royal-elephant-game-ui-7x7.png')
                : require('../../../../assets/royal-elephant-game-ui-8x8.png')
            }
            style={{ width: screenWidth, height: Math.round(screenWidth * (1844 / 853)) }}
            resizeMode="cover"
          />

          {/* Invisible back button — top-left corner */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ position: 'absolute', top: 22 * s, left: 25 * s, width: 50 * s, height: 50 * s, zIndex: 10 }}
            activeOpacity={1}
          />

          {/* Stats above board */}
          <View style={{ position: 'absolute', top: hudPositions[level.rows].lotus.top * s, left: hudPositions[level.rows].lotus.left * s }}>
            <Text style={{ fontFamily: 'Cinzel', fontSize: 18 * s, color: '#D4AF37', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
              {gameState.collectedLotus.length}/{level.lotus.length}
            </Text>
          </View>
          <View style={{ position: 'absolute', top: 130 * s, left:0, right: 0, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Cinzel', fontSize: 20 * s, color: '#D4AF37', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, textAlign: 'center' }}>
              Level {level.id}
            </Text>
            <Text style={{ fontFamily: 'Cinzel', fontSize: 15 * s, color: 'rgba(212, 175, 55, 0.6)', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, textAlign: 'center' }}>
              {level.name}
            </Text>
          </View>
          <View style={{ position: 'absolute', top: hudPositions[level.rows].steps.top * s, left: hudPositions[level.rows].steps.left * s }}>
            <Text style={{ fontFamily: 'Cinzel', fontSize: 18 * s, color: '#D4AF37', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, marginLeft: 14 }}>
              {gameState.moves}/{level.parMoves}
            </Text>
          </View>
              <View style={{ position: 'absolute', top: hudPositions[level.rows].coins.top * s, right: hudPositions[level.rows].coins.right * s, width: hudPositions[level.rows].coins.width * s, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Cinzel', fontSize: 18 * s, color: '#D4AF37', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, textAlign: 'center' }}>
              {gameState.collectedCoins.length}/{level.coins.length}
            </Text>
          </View>

          {/* Game board — centered on the image */}
          <View style={{
            position: 'absolute',
            top: gridStyles[level.rows].container.top * s,
            left: (gridStyles[level.rows].container.left ?? 0) * s,
            right: (gridStyles[level.rows].container.right ?? 0) * s,
            alignItems: (gridStyles[level.rows].container.alignItems as any) ?? 'center',
          }}>
            <View style={{ position: 'relative' }}>
              <GameBoard
                state={gameState}
                tileSize={tileSize}
                tileHeightFactor={gridStyles[level.rows].tileHeightFactor}
                tileWidthFactor={gridStyles[level.rows].tileWidthFactor}
                hintTile={hintTile}
                gateOpening={gateOpening}
                onTilePress={handleTilePress}
              />
            </View>
          </View>

          {/* Bottom buttons: Restart (left), Hint (middle), Undo (right) — separate */}
          <TouchableOpacity
            onPress={handleRestart}
            style={{ position: 'absolute', bottom: hudPositions[level.rows].restart.bottom * s, left: hudPositions[level.rows].restart.left * s, width: 90 * s, height: 80 * s }}
            activeOpacity={1}
          />
          <TouchableOpacity
            onPress={handleHint}
            style={{ position: 'absolute', bottom: hudPositions[level.rows].hint.bottom * s, left: hudPositions[level.rows].hint.left * s, width: 90 * s, height: 80 * s }}
            activeOpacity={1}
          />
          <TouchableOpacity
            onPress={handleUndo}
            style={{ position: 'absolute', bottom: hudPositions[level.rows].undo.bottom * s, right: hudPositions[level.rows].undo.right * s, width: 90 * s, height: 80 * s }}
            activeOpacity={1}
          />

          {/* Level tip */}
          {level.tip && (
            <View style={{
              position: 'absolute',
              bottom: tipPositions[level.rows].bottom * s,
              left: tipPositions[level.rows].left * s,
              right: tipPositions[level.rows].right * s,
              alignItems: 'center',
            }}>
              <Text style={{
                fontFamily: 'Cinzel',
                fontSize: tipPositions[level.rows].fontSize * s,
                color: '#D4AF37',
                textAlign: 'center',
                lineHeight: 16 * s,
              }}>
                {level.tip}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Victory dialog */}
      {showVictory && (
        <VictoryDialog
          levelNumber={level.id}
          moves={gameState.moves}
          parMoves={level.parMoves}
          allLotusCollected={gameState.collectedLotus.length >= level.lotus.length}
          allCoinsCollected={gameState.collectedCoins.length >= level.coins.length}
          lotusesCollected={gameState.collectedLotus.length}
          totalLotuses={level.lotus.length}
          coinsCollected={gameState.collectedCoins.length}
          totalCoins={level.coins.length}
          xpEarned={xpEarned}
          coinsEarned={coinsEarned}
          onNext={handleNextLevel}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* Pause dialog */}
      {showPause && (
        <PauseDialog
          onResume={() => setShowPause(false)}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}
    </View>
  );
}
