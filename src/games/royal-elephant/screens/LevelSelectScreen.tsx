import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { getLevels } from '../engine';
import {
  loadLevelProgress,
  LevelProgressMap,
} from '../../../core/storage';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PNG_WIDTH = 853;
const PNG_HEIGHT = 4273;

// Card positions in design-space (853 × 4273)
// 2 columns × 8 rows
const CARD_W = 350;
const CARD_H = 295;
const COLS = 2;

// Levels 1-8 (top half)
const TOP_HEADER_END = 370;
const TOP_CARD_AREA_START = TOP_HEADER_END + 30;
const TOP_ROW_GAP = 25;
const TOP_COL_GAP = 30;
const TOP_ROW_HEIGHT = CARD_H + TOP_ROW_GAP;
const COL_WIDTH = (PNG_WIDTH - TOP_COL_GAP) / COLS;

// Levels 9-15 (bottom half) — adjust these to match your PNG
const BOT_HEADER_END = 1693;  // Y where row 5 starts in your PNG
const BOT_CARD_AREA_START = BOT_HEADER_END;
const BOT_ROW_GAP = 38;
const BOT_COL_GAP = 30;
const BOT_ROW_HEIGHT = CARD_H + BOT_ROW_GAP + 2;

function getCardCenter(levelId: number) {
  const isBottom = levelId > 8;
  const idx = isBottom ? levelId - 9 : levelId - 1;
  const row = Math.floor(idx / COLS);
  const col = idx % COLS;
  const colGap = isBottom ? BOT_COL_GAP : TOP_COL_GAP;
  const colW = (PNG_WIDTH - colGap) / COLS;
  const cx = colGap / 2 + col * colW + colW / 2;
  const areaStart = isBottom ? BOT_CARD_AREA_START : TOP_CARD_AREA_START;
  const rowH = isBottom ? BOT_ROW_HEIGHT : TOP_ROW_HEIGHT;
  const cy = areaStart + row * rowH + CARD_H / 2;
  return { cx, cy };
}

export default function LevelSelectScreen() {
  const navigation = useNavigation<Nav>();
  const { width: screenWidth } = useWindowDimensions();
  const levels = getLevels();
  const [progress, setProgress] = useState<LevelProgressMap>({});
  const prevProgressRef = useRef<LevelProgressMap>({});
  const lockAnims = useRef<Map<number, { shake: Animated.Value; fade: Animated.Value; contentFade: Animated.Value }>>(new Map());
  const [animatingLevel, setAnimatingLevel] = useState<number | null>(null);

  const s = screenWidth / PNG_WIDTH;
  const imgHeight = Math.round(screenWidth * (PNG_HEIGHT / PNG_WIDTH));

  // Detect newly unlocked levels and trigger animation
  useEffect(() => {
    const prev = prevProgressRef.current;
    for (const level of levels) {
      const wasLocked = !prev[level.id]?.stars;
      const isNowUnlocked = !!progress[level.id]?.stars;
      if (wasLocked && isNowUnlocked && !lockAnims.current.has(level.id)) {
        const shake = new Animated.Value(0);
        const fade = new Animated.Value(1);
        const contentFade = new Animated.Value(0.3);
        lockAnims.current.set(level.id, { shake, fade, contentFade });
        setAnimatingLevel(level.id);

        // Shake twice then fade out
        Animated.sequence([
          // Shake 1
          Animated.sequence([
            Animated.timing(shake, { toValue: 8, duration: 50, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -8, duration: 50, useNativeDriver: true }),
          ]),
          // Shake 2
          Animated.sequence([
            Animated.timing(shake, { toValue: 8, duration: 50, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -8, duration: 50, useNativeDriver: true }),
          ]),
          Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
          // Fade out lock + fade in content simultaneously
          Animated.parallel([
            Animated.timing(fade, { toValue: 0, duration: 600, useNativeDriver: true }),
            Animated.timing(contentFade, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]),
        ]).start(() => {
          setAnimatingLevel(null);
        });
      }
    }
    prevProgressRef.current = progress;
  }, [progress, levels]);

  useFocusEffect(
    useCallback(() => {
      loadLevelProgress().then(setProgress);
    }, [])
  );

  const handleLevelPress = (levelId: number) => {
    if (levelId > 1 && !progress[levelId - 1]?.stars) return;
    navigation.navigate('RoyalElephant', { level: levelId });
  };

  const getStars = (levelId: number) => progress[levelId]?.stars ?? 0;
  const isUnlocked = (levelId: number) => levelId === 1 || !!progress[levelId - 1]?.stars;

  return (
    <View style={{ flex: 1, backgroundColor: '#081B3A' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ width: screenWidth, position: 'relative' }}>
          <Image
            source={require('../../../../assets/royal-elephant-levels.png')}
            style={{ width: screenWidth, height: imgHeight }}
            resizeMode="cover"
          />

          {/* Back button — over home icon (top-left) */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: (30 * s) + 8,
              left: (15 * s) + 12,
              width: 130 * s,
              height: 130 * s,
            }}
            activeOpacity={1}
          />

          {/* Level cards — invisible hit targets + overlay text */}
          {levels.map((level) => {
            const { cx, cy } = getCardCenter(level.id);
            const unlocked = isUnlocked(level.id);
            const stars = getStars(level.id);
            const colOffset = level.id % 2 === 1 ? 22 : -23;
            const rowOffset = (level.id === 19 || level.id === 20) ? 3 : 0;
            const anim = lockAnims.current.get(level.id);
            const isAnimating = animatingLevel === level.id;

            const contentOpacity = anim && isAnimating
              ? anim.contentFade
              : unlocked ? 1 : 0.3;

            const lockOpacity = anim && isAnimating
              ? anim.fade
              : 1;

            const lockTranslateX = anim && isAnimating
              ? anim.shake
              : 0;

            return (
              <TouchableOpacity
                key={level.id}
                activeOpacity={unlocked ? 0.7 : 1}
                onPress={() => handleLevelPress(level.id)}
                style={{
                  position: 'absolute',
                  left: (cx - CARD_W / 2 + colOffset) * s,
                  top: (cy - CARD_H / 2 + rowOffset) * s,
                  width: CARD_W * s,
                  height: CARD_H * s,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Animated.View style={{ marginTop: -10 * s, alignItems: 'center', opacity: contentOpacity }}>
                {/* Level number */}
                <Text
                  style={{
                    fontFamily: 'Cinzel',
                    fontSize: 40 * s,
                    color: '#D4AF37',
                    fontWeight: 'bold',
                  }}
                >
                  {"Level " + level.id}
                </Text>

                {/* Level name */}
                <Text
                  style={{
                    fontFamily: 'Cinzel',
                    fontSize: 25 * s,
                    color: 'rgba(212, 175, 55, 0.7)',
                    marginTop: 6 * s,
                    textAlign: 'center',
                    paddingHorizontal: 8 * s,
                  }}
                  numberOfLines={2}
                >
                  {level.name}
                </Text>

                {/* Stars */}
                <View style={{ flexDirection: 'row', marginTop: 10 * s }}>
                  {[1, 2, 3].map((st) => (
                    <Text
                      key={st}
                      style={{
                        fontSize: 50 * s,
                        marginHorizontal: 2 * s,
                        color: st <= stars ? '#FCBA03' : '#000',
                        opacity: st <= stars ? 1 : 1,
                      }}
                    >
                      ★
                    </Text>
                  ))}
                </View>
                </Animated.View>

                {/* Lock overlay for locked levels */}
                {!unlocked && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: -10,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: lockOpacity,
                      transform: [{ translateX: lockTranslateX }],
                    }}
                  >
                    <Text style={{ fontSize: 80 * s }}>🔒</Text>
                  </Animated.View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
