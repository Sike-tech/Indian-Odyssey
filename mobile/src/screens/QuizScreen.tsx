import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, QuestionView, AnswerResult } from '../types';
import { useProfile } from '../hooks/useProfile';
import { QuizSession, STREAK_STEP, STREAK_CAP, COINS_PER_CORRECT } from '../core/engine';
import { FIFTY_FIFTY_COST, SKIP_COST } from '../core/engine';
import { DIFFICULTY_XP } from '../data/questions';
import { CATEGORIES } from '../data/questions';
import { titleForLevel } from '../data/achievements';
import { Icon } from '../components/ui/Icon';
import {
  PNG_WIDTH,
  PNG_HEIGHT,
  BACK_BUTTON,
  COIN_BAR,
  CATEGORY_BADGE,
  QUESTION_BOX,
  ANSWER_A,
  ANSWER_B,
  ANSWER_C,
  ANSWER_D,
  SELECT_A,
  SELECT_B,
  SELECT_C,
  SELECT_D,
  GLOW_A,
  GLOW_B,
  GLOW_C,
  GLOW_D,
  OPT_GLOW_A,
  OPT_GLOW_B,
  OPT_GLOW_C,
  OPT_GLOW_D,
  SUBMIT,
  HINT,
  SKIP,
  XP_PANEL,
} from '../data/QuestionLayout';

type QuizRoute = RouteProp<RootStackParamList, 'Quiz'>;
type QuizNav = NativeStackNavigationProp<RootStackParamList>;

const ANSWER_RECTS = [ANSWER_A, ANSWER_B, ANSWER_C, ANSWER_D];
const SELECT_RECTS = [SELECT_A, SELECT_B, SELECT_C, SELECT_D];

function formatCoins(n: number): string {
  if (n >= 100000) return `${Math.round(n / 1000)}k`;
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${n / 1000}`.replace(/\.0$/, '') + 'k';
  return String(n);
}

export default function QuizScreen() {
  const navigation = useNavigation<QuizNav>();
  const route = useRoute<QuizRoute>();
  const { profile, save, refresh } = useProfile();
  const { width: sw } = useWindowDimensions();
  const s = sw / PNG_WIDTH;
  const imgH = Math.round(sw * (PNG_HEIGHT / PNG_WIDTH));

  const [session] = useState(() => new QuizSession(profile, route.params?.category));
  const [question, setQuestion] = useState<QuestionView>(() => session.currentQuestion());
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [xpAnim] = useState(new Animated.Value(0));
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerPaused, setTimerPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate preview XP for current question
  const previewXp = (() => {
    const base = DIFFICULTY_XP[question.difficulty] ?? 10;
    const mult = 1 + STREAK_STEP * Math.min(session.streak, STREAK_CAP);
    return Math.round(base * mult);
  })();

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
  }, [navigation]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Timer: 60 seconds per question
  useEffect(() => {
    if (result || timerPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.position, result, timerPaused]);

  // Auto-submit when timer runs out
  useEffect(() => {
    if (timeLeft === 0 && !result) {
      if (selected !== null) {
        handleTimeout();
      } else {
        handleTimeout();
      }
    }
  }, [timeLeft, result]);

  const handleTimeout = () => {
    try {
      const res = session.answer(selected ?? 0, true);
      setResult(res);
      setToast(null);
    } catch {
      finishGame();
    }
  };

  const showXpPopup = useCallback((amount: number) => {
    xpAnim.setValue(0);
    Animated.sequence([
      Animated.timing(xpAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(xpAnim, { toValue: 0, duration: 400, delay: 600, useNativeDriver: true }),
    ]).start();
  }, [xpAnim]);

  const handleSelect = (index: number) => {
    if (result || removed.has(index)) return;
    setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null || result) return;
    try {
      const res = session.answer(selected);
      setResult(res);
      if (res.xpGained > 0) showXpPopup(res.xpGained);
      res.levelUps.forEach((lvl) => {
        setToast(`Level Up! You are now Level ${lvl} - '${titleForLevel(lvl)}'!`);
      });
    } catch (e) {
      setToast((e as Error).message);
    }
  };

  const handleFifty = () => {
    try {
      const r = session.useFiftyFifty();
      setRemoved(new Set(r));
    } catch (e) {
      setToast((e as Error).message);
    }
  };

  const handleSkip = () => {
    try {
      session.useSkip();
      nextQuestion();
    } catch (e) {
      setToast((e as Error).message);
    }
  };

  const nextQuestion = () => {
    if (session.finished) {
      finishGame();
      return;
    }
    setTimeLeft(60);
    setResult(null);
    setSelected(null);
    setRemoved(new Set());
    setQuestion(session.currentQuestion());
  };

  const finishGame = () => {
    const badges = session.finalize();
    const summary = session.summary();
    save().then(() => {
      refresh();
      navigation.replace('Result', { summary, newBadges: badges.map((b) => b.id) });
    });
  };

  const goBack = () => navigation.replace('Home');

  const meta = CATEGORIES[question.category];

  const optionState = (index: number) => {
    if (!result) {
      if (selected === index) return 'selected';
      return removed.has(index) ? 'removed' : 'default';
    }
    if (index === result.correctIndex) return 'correct';
    if (index === selected && !result.correct) return 'wrong';
    if (removed.has(index)) return 'removed';
    return 'default';
  };

  const r = (rect: { x: number; y: number; w: number; h: number }) => ({
    position: 'absolute' as const,
    left: rect.x * s,
    top: rect.y * s,
    width: rect.w * s,
    height: rect.h * s,
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#030914' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ width: sw, position: 'relative' }}>
          <Image
            source={require('../../assets/question-page.png')}
            style={{ width: sw, height: imgH }}
          />

          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {/* Back button */}
        <TouchableOpacity
          onPress={goBack}
          style={{
            position: 'absolute',
            left: (BACK_BUTTON.cx - BACK_BUTTON.r - 24) * s,
            top: (BACK_BUTTON.cy - BACK_BUTTON.r - 275) * s,
            width: BACK_BUTTON.r * 2.3 * s,
            height: BACK_BUTTON.r * 2.3 * s,
            zIndex: 10,
          }}
        />

        {/* Coins counter */}
        <View
          style={{
            position: 'absolute',
            left: (COIN_BAR.x + 150) * s,
            top: (COIN_BAR.y + 40) * s,
            width: COIN_BAR.w * s,
            height: COIN_BAR.h * s,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Eaglore',
              fontSize: Math.min(35, 35 * s),
              color: '#D4AF37',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
              width: COIN_BAR.w * s,
              textAlign: 'center',
            }}
          >
            {formatCoins(profile.coins)}
          </Text>
        </View>

        {/* Everything below top bar — shifted down 10px */}
        <View style={{ position: 'absolute', top: 10 * s, left: 0, right: 0, bottom: 0 }}>

        {/* Timer — left of category badge */}
        <View
          style={{
            position: 'absolute',
            left: (58 - 17) * s,
            top: (CATEGORY_BADGE.y + 8) * s,
            width: 150 * s,
            height: CATEGORY_BADGE.h * s,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Eaglore',
              fontSize: Math.min(70, 70 * s),
              color: timeLeft <= 10 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(212, 175, 55, 0.8)',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
              textAlign: 'center',
            }}
          >
            {timeLeft}
          </Text>
        </View>

        {/* Invisible pause button — below timer (testing) */}
        <TouchableOpacity
          onPress={() => setTimerPaused((p) => !p)}
          style={{
            position: 'absolute',
            left: (58 - 15) * s,
            top: (CATEGORY_BADGE.y + 3 + 3 + CATEGORY_BADGE.h) * s,
            width: 150 * s,
            height: 40 * s,
          }}
          activeOpacity={1}
        />

        {/* Category badge */}
        <View style={r(CATEGORY_BADGE)} className="items-center justify-center">
          <Text
            style={{
              fontFamily: 'Eaglore',
              fontSize: Math.min(60, 60 * s),
              color: 'rgba(212, 175, 55, 0.8)',
              textShadowColor: 'rgba(0, 0, 0, 0.6)',
              textShadowOffset: { width: 1, height: 2 },
              textShadowRadius: 3,
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginTop: 6,
              marginLeft: 2,
            }}
          >
            {meta.name}
          </Text>
        </View>

        {/* Question counter */}
        <View
          style={{
            position: 'absolute',
            left: (CATEGORY_BADGE.x + CATEGORY_BADGE.w + 115) * s,
            top: (CATEGORY_BADGE.y + 5) * s,
            width: 60 * s,
            height: CATEGORY_BADGE.h * s,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Eaglore',
              fontSize: Math.min(45, 45 * s),
              color: 'rgba(212, 175, 55, 0.8)',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
              textAlign: 'center',
            }}
          >
            {question.position}/{question.total}
          </Text>
        </View>

        {/* Question text — scrollable */}
          <View
            style={{
              position: 'absolute',
              left: QUESTION_BOX.x * s + 8,
              top: QUESTION_BOX.y * s + 20,
              width: QUESTION_BOX.w * s - 16,
              height: QUESTION_BOX.h * s,
              overflow: 'hidden',
            }}
          >
          <ScrollView
            nestedScrollEnabled
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text
              style={{
              fontFamily: 'Constantine',
                fontSize: Math.min(45, 45 * s),
                textAlign: 'center',
                lineHeight: 30,
                color: 'rgba(212, 175, 55, 0.9)',
                textShadowColor: 'rgba(0, 0, 0, 1)',
                textShadowOffset: { width: 1, height: 2 },
                textShadowRadius: 3,
                letterSpacing: 0.5,
              }}
            >
              {question.text}
            </Text>
          </ScrollView>
        </View>

        {/* Glow buttons — soft center glow when option selected */}
        {[GLOW_A, GLOW_B, GLOW_C, GLOW_D].map((g, idx) => {
          const isActive = selected === idx;
          const state = optionState(idx);
          const isCorrect = state === 'correct';
          const isWrong = state === 'wrong';
          const r = g.r * s;

          const glowColor = result
            ? isCorrect ? '#22c55e' : isWrong ? '#ef4444' : '#D4AF37'
            : '#D4AF37';

          const showGlow = result ? isActive : isActive;

          return (
            <View
              key={`glow-${idx}`}
              style={{
                position: 'absolute',
                left: (g.cx - g.r) * s,
                top: (g.cy - g.r) * s,
                width: r * 2,
                height: r * 2,
                borderRadius: r,
                shadowColor: glowColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: showGlow ? 1 : 0,
                shadowRadius: showGlow ? r * 1.12 : 0,
                elevation: showGlow ? 14 : 0,
              }}
            />
          );
        })}

        {/* Option glow buttons — capsule-right shape */}
        {[OPT_GLOW_A, OPT_GLOW_B, OPT_GLOW_C, OPT_GLOW_D].map((rect, idx) => {
          const isActive = selected === idx;
          const state = optionState(idx);
          const isCorrect = state === 'correct';
          const isWrong = state === 'wrong';

          const glowColor = result
            ? isCorrect ? '#22c55e' : isWrong ? '#ef4444' : '#D4AF37'
            : '#D4AF37';

          const showGlow = result ? (isCorrect || isWrong) : isActive;

          return (
            <View
              key={`optglow-${idx}`}
              style={{
                position: 'absolute',
                left: rect.x * s,
                top: rect.y * s,
                width: rect.w * s,
                height: rect.h * s,
                borderTopRightRadius: 46 * s,
                borderBottomRightRadius: 46 * s,
                borderTopLeftRadius: 46 * s,
                borderBottomLeftRadius: 46 * s,
                borderWidth: 0,
                shadowColor: glowColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: showGlow ? 1 : 0,
                shadowRadius: showGlow ? 28 : 0,
                elevation: showGlow ? 14 : 0,
              }}
            />
          );
        })}

        {/* Select buttons — invisible buttons to the left of each option */}
        {SELECT_RECTS.map((rect, idx) => (
          <TouchableOpacity
            key={`select-${idx}`}
            activeOpacity={1}
            onPress={() => handleSelect(idx)}
            disabled={!!result}
            style={{
              ...r(rect),
              borderTopLeftRadius: 35 * s,
              borderBottomLeftRadius: 35 * s,
            }}
          />
        ))}

        {/* Answer options */}
        {question.options.map((opt, idx) => {
          const rect = ANSWER_RECTS[idx];
          const state = optionState(idx);
          const isDefault = state === 'default';
          const isSelected = state === 'selected';
          const isCorrect = state === 'correct';
          const isWrong = state === 'wrong';
          const isRemoved = state === 'removed';

          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={isDefault || isSelected ? 0.8 : 1}
              onPress={() => handleSelect(idx)}
              disabled={!!result || isRemoved}
              style={r(rect)}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingHorizontal: 14 * s,
                  paddingTop: 10 * s + 4,
                }}
              >
                <Text
                  style={{
                    width: (ANSWER_RECTS[idx].w - 28) * s,
              fontFamily: 'Georgia',
                    fontSize: Math.min(35, 34 * s),
                    color: isCorrect
                      ? '#86efac'
                      : isWrong
                      ? '#fca5a5'
                      : isRemoved
                      ? 'rgba(255,255,255,0.15)'
                      : '#D4AF37',
                    textAlign: 'left',
                    lineHeight: 38,
                    textShadowColor: 'rgba(0, 0, 0, 0.5)',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2,
                    marginTop: idx === 3 ? 5 : 0,
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {opt}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Hint button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleFifty}
          disabled={profile.coins < FIFTY_FIFTY_COST}
          style={{
            position: 'absolute',
            left: (HINT.cx - HINT.r) * s,
            top: (HINT.cy - HINT.r) * s,
            width: HINT.r * 2 * s,
            height: HINT.r * 2 * s,
          }}
        />

        {/* Skip button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSkip}
          disabled={profile.coins < SKIP_COST}
          style={{
            position: 'absolute',
            left: (SKIP.cx - SKIP.r) * s,
            top: (SKIP.cy - SKIP.r) * s,
            width: SKIP.r * 2 * s,
            height: SKIP.r * 2 * s,
          }}
        />

        {/* Submit / Next button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={result ? nextQuestion : handleSubmit}
          disabled={!result && selected === null}
          style={r(SUBMIT)}
        >
          <View className="flex-1 items-center justify-center">
            <Text
              style={{
                fontFamily: 'Eaglore',
                fontSize: Math.min(60, 60 * s),
                color: result
                  ? 'rgba(212, 175, 55, 0.8)'
                  : selected !== null
                  ? 'rgba(212, 175, 55, 0.8)'
                  : 'rgba(255,255,255,0.25)',
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
                letterSpacing: 2,
                marginTop: 5,
                marginLeft: 4,
              }}
            >
              {result ? 'NEXT' : 'SUBMIT'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* XP/Coins preview — bottom panel */}
        {!result && (
          <>
            <Text
              style={{
                position: 'absolute',
                left: XP_PANEL.x * s,
                top: (XP_PANEL.y + 73) * s,
                width: (XP_PANEL.w / 2) * s,
                fontFamily: 'Georgia',
                fontSize: Math.min(40, 40 * s),
                color: 'rgba(212, 175, 55, 0.9)',
                textAlign: 'center',
                textShadowColor: 'rgba(0, 0, 0, 0.4)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              +{previewXp} XP
            </Text>
            <Text
              style={{
                position: 'absolute',
                left: (XP_PANEL.x + XP_PANEL.w / 2) * s + 27,
                top: (XP_PANEL.y + 73) * s,
                width: (XP_PANEL.w / 2) * s,
                fontFamily: 'Georgia',
                fontSize: Math.min(40, 40 * s),
                color: 'rgba(212, 175, 55, 0.9)',
                textAlign: 'center',
                textShadowColor: 'rgba(0, 0, 0, 0.4)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              +25 AU
            </Text>
          </>
        )}

        </View>{/* end shifted container */}

        {/* XP Popup */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '35%',
            alignItems: 'center',
            opacity: xpAnim,
            transform: [{ translateY: xpAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }],
          }}
        >
          <Text
            style={{
              fontFamily: 'Georgia',
              fontSize: 28,
              fontWeight: 'bold',
              color: '#D4AF37',
              textShadowColor: 'rgba(0, 0, 0, 0.8)',
              textShadowOffset: { width: 1, height: 2 },
              textShadowRadius: 5,
            }}
          >
            +{result?.xpGained ?? 0} XP
          </Text>
        </Animated.View>

        {/* Toast */}
        {toast ? (
          <View className="absolute bottom-24 left-5 right-5 bg-midnight-500/95 border border-royal/25 rounded-2xl px-4 py-3 shadow-card">
            <Text
              style={{
                fontFamily: 'Georgia',
                fontSize: 14,
                fontWeight: '600',
                color: '#D4AF37',
                textAlign: 'center',
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {toast}
            </Text>
          </View>
        ) : null}
      </View>
        </View>
      </ScrollView>
    </View>
  );
}
