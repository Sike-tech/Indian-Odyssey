import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, CategoryKey, QuestionView, AnswerResult } from '../types';
import { useProfile } from '../hooks/useProfile';
import { QuizSession } from '../core/engine';
import { CATEGORIES } from '../data/questions';
import { titleForLevel } from '../data/achievements';
import { Icon } from '../components/ui/Icon';
import { Card, ProgressBar } from '../components/ui';

const { width } = Dimensions.get('window');

type QuizRoute = RouteProp<RootStackParamList, 'Quiz'>;
type QuizNav = NativeStackNavigationProp<RootStackParamList>;

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizScreen() {
  const navigation = useNavigation<QuizNav>();
  const route = useRoute<QuizRoute>();
  const { profile, save, refresh } = useProfile();

  const [session] = useState(() => new QuizSession(profile, route.params?.category));
  const [question, setQuestion] = useState<QuestionView>(() => session.currentQuestion());
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [xpAnim] = useState(new Animated.Value(0));

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
  }, [navigation]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showXpPopup = useCallback((amount: number) => {
    xpAnim.setValue(0);
    Animated.sequence([
      Animated.timing(xpAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(xpAnim, {
        toValue: 0,
        duration: 400,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [xpAnim]);

  const handleAnswer = (index: number) => {
    if (result || removed.has(index)) return;
    try {
      const res = session.answer(index);
      setResult(res);
      if (res.xpGained > 0) showXpPopup(res.xpGained);
      res.levelUps.forEach((lvl) => {
        setToast(`Level Up! You are now Level ${lvl} - '${titleForLevel(lvl)}'!`);
      });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
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
    setResult(null);
    setRemoved(new Set());
    setQuestion(session.currentQuestion());
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const finishGame = () => {
    const badges = session.finalize();
    const summary = session.summary();
    save().then(() => {
      refresh();
      navigation.replace('Result', {
        summary,
        newBadges: badges.map((b) => b.id),
      });
    });
  };

  const goHome = () => {
    navigation.replace('Home');
  };

  const meta = CATEGORIES[question.category];
  const categoryName = meta.name;
  const categoryColor = meta.color;

  const optionState = (index: number) => {
    if (!result) {
      return removed.has(index) ? 'removed' : 'default';
    }
    if (index === result.correctIndex) return 'correct';
    if (removed.has(index)) return 'removed';
    return 'wrong';
  };

  return (
    <LinearGradient
      colors={['#081B3A', '#030914']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* HUD */}
        <View className="px-5 pt-3 pb-2 flex-row items-center">
          <TouchableOpacity onPress={goHome} className="p-1 -ml-1">
            <Icon name="arrow-left" size={26} color="#D4AF37" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-sm ml-2 flex-1 tracking-wide">
            Question {question.position}/{question.total}
          </Text>
          <View className="flex-row items-center space-x-3">
            <View className="flex-row items-center">
              <Icon name="star" size={18} color="#D4AF37" />
              <Text className="text-white text-xs font-semibold ml-1">
                {session.xpEarned}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Icon
                name="fire"
                size={18}
                color={session.streak >= 2 ? '#D4AF37' : '#6B581A'}
              />
              <Text className="text-white text-xs font-semibold ml-1">
                {session.streak}
              </Text>
            </View>
          </View>
          <Text className="text-white/80 text-xs font-semibold ml-3">
            Lvl {profile.level}
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <ProgressBar value={session.index} max={session.total} height={6} />

          <View className="flex-row items-center mt-2">
            <Text style={{ color: categoryColor }} className="text-xs font-bold uppercase tracking-[2px]">
              {categoryName}
            </Text>
            <Text className="text-white/30 mx-2">•</Text>
            <Text className="text-white/50 text-xs capitalize tracking-wide">
              {question.difficulty}
            </Text>
          </View>

          {/* Question Card */}
          <Card className="mt-4 p-5 rounded-[24px]">
            <Text className="text-white text-lg leading-6 font-semibold" style={{ fontFamily: 'Georgia' }}>
              {question.text}
            </Text>
          </Card>

          {/* Options */}
          <View className="mt-4 space-y-3">
            {question.options.map((opt, idx) => {
              const state = optionState(idx);
              const isDefault = state === 'default';
              const isCorrect = state === 'correct';
              const isWrong = state === 'wrong';
              const isRemoved = state === 'removed';

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={isDefault ? 0.8 : 1}
                  onPress={() => handleAnswer(idx)}
                  disabled={!isDefault}
                  className="flex-row items-center"
                >
                  <View
                    className={[
                      'flex-1 flex-row items-center rounded-2xl border px-4 py-3.5',
                      isCorrect
                        ? 'bg-green-900/30 border-green-500/50'
                        : isWrong
                        ? 'bg-red-900/25 border-red-500/35'
                        : isRemoved
                        ? 'bg-midnight-600/40 border-white/5 opacity-60'
                        : 'bg-midnight-500/90 border-royal/20',
                    ].join(' ')}
                    style={isDefault ? {
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 12,
                      elevation: 6,
                    } : undefined}
                  >
                    <View
                      className={[
                        'w-8 h-8 rounded-full items-center justify-center mr-3 border',
                        isCorrect
                          ? 'bg-green-600 border-green-400'
                          : isWrong
                          ? 'bg-red-600 border-red-400'
                          : isRemoved
                          ? 'bg-midnight-300 border-white/10'
                          : 'bg-gradient-to-br from-royal-200 to-royal-500 border-royal-100',
                      ].join(' ')}
                    >
                      <Text
                        className={[
                          'text-sm font-bold',
                          isDefault || isRemoved ? 'text-midnight-900' : 'text-white',
                        ].join(' ')}
                      >
                        {isRemoved ? '—' : OPTION_LABELS[idx]}
                      </Text>
                    </View>
                    <Text
                      className={[
                        'flex-1 text-[15px] leading-5',
                        isRemoved ? 'text-white/30' : 'text-white/90',
                      ].join(' ')}
                    >
                      {isRemoved ? '' : opt}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Fact / Result Card */}
          {result ? (
            <Card className="mt-5 p-5 rounded-[24px]">
              <Text
                className={[
                  'text-base font-bold tracking-wide',
                  result.correct ? 'text-green-400' : 'text-red-400',
                ].join(' ')}
              >
                {result.correct
                  ? 'Correct!'
                  : `Wrong! Correct answer: ${question.options[result.correctIndex]}`}
              </Text>
              <Text className="text-white/70 text-sm mt-2 leading-5">
                Fun fact: {result.fact}
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={nextQuestion}
                className="mt-4 rounded-2xl py-3.5 items-center overflow-hidden border border-royal-100/40"
                style={{
                  backgroundColor: '#D4AF37',
                  shadowColor: '#D4AF37',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 14,
                  elevation: 8,
                }}
              >
                <Text className="text-midnight-900 font-bold tracking-wider">
                  {session.finished ? 'SEE RESULT' : 'NEXT'}
                </Text>
              </TouchableOpacity>
            </Card>
          ) : null}

          {/* Bottom Spacer */}
          <View className="h-4" />
        </ScrollView>

        {/* Lifelines (fixed bottom) */}
        {!result ? (
          <LinearGradient
            colors={['rgba(3,9,20,0)', 'rgba(8,27,58,0.92)', '#081B3A']}
            locations={[0, 0.55, 1]}
            className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-8"
          >
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleFifty}
                disabled={session.lifelines.fifty <= 0}
                className={[
                  'flex-1 rounded-2xl py-3.5 items-center border overflow-hidden',
                  session.lifelines.fifty > 0
                    ? 'border-royal-100/50'
                    : 'bg-midnight-600 border-white/10 opacity-50',
                ].join(' ')}
                style={
                  session.lifelines.fifty > 0
                    ? {
                        backgroundColor: '#D4AF37',
                        shadowColor: '#D4AF37',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 14,
                        elevation: 8,
                      }
                    : undefined
                }
              >
                <Text className="text-midnight-900 font-bold tracking-wide">50 : 50 ({session.lifelines.fifty})</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSkip}
                disabled={session.lifelines.skip <= 0}
                className={[
                  'flex-1 rounded-2xl py-3.5 items-center border overflow-hidden',
                  session.lifelines.skip > 0
                    ? 'bg-midnight-500 border-royal/30'
                    : 'bg-midnight-600 border-white/10 opacity-50',
                ].join(' ')}
                style={
                  session.lifelines.skip > 0
                    ? {
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 12,
                        elevation: 5,
                      }
                    : undefined
                }
              >
                <Text className="text-royal-100 font-bold tracking-wide">SKIP ({session.lifelines.skip})</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ) : null}

        {/* XP Popup */}
        <Animated.View
          pointerEvents="none"
          className="absolute left-0 right-0 items-center"
          style={{
            top: '35%',
            opacity: xpAnim,
            transform: [
              {
                translateY: xpAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -40],
                }),
              },
            ],
          }}
        >
          <Text className="text-royal-100 text-2xl font-extrabold" style={{ textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}>
            +{result?.xpGained ?? 0} XP
          </Text>
        </Animated.View>

        {/* Toast */}
        {toast ? (
          <View className="absolute bottom-24 left-5 right-5 bg-midnight-500/95 border border-royal/25 rounded-2xl px-4 py-3 shadow-card">
            <Text className="text-royal-100 text-center text-sm font-semibold">{toast}</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}
