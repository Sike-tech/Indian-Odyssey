import React from 'react';
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Icon } from '../../../components/ui/Icon';

const PNG_WIDTH = 700;
const PNG_HEIGHT = 900;

interface VictoryDialogProps {
  levelNumber: number;
  moves: number;
  parMoves: number;
  allLotusCollected: boolean;
  allCoinsCollected: boolean;
  xpEarned: number;
  coinsEarned: number;
  onNext: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export function VictoryDialog({
  levelNumber,
  moves,
  parMoves,
  allLotusCollected,
  allCoinsCollected,
  xpEarned,
  coinsEarned,
  onNext,
  onRestart,
  onHome,
}: VictoryDialogProps) {
  const { width: sw } = useWindowDimensions();
  const s = sw / PNG_WIDTH;
  const stars = allLotusCollected && allCoinsCollected && moves <= parMoves ? 3 : allLotusCollected && moves <= parMoves ? 2 : 1;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      {/* Backdrop */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />

      {/* Dialog PNG */}
      <Image
        source={require('../../../../assets/victory-dialog.png')}
        style={{ width: PNG_WIDTH * s, height: PNG_HEIGHT * s }}
        resizeMode="contain"
      />

      {/* Overlay content */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        {/* Level complete text */}
        <Text style={{
          fontFamily: 'Cinzel',
          fontSize: 22 * s,
          color: '#D4AF37',
          fontWeight: 'bold',
          textShadowColor: 'rgba(0,0,0,0.6)',
          textShadowOffset: { width: 1, height: 2 },
          textShadowRadius: 3,
          marginTop: -80 * s,
        }}>
          Level {levelNumber} Complete
        </Text>

        {/* Stars */}
        <View style={{ flexDirection: 'row', marginTop: 20 * s }}>
          {[1, 2, 3].map((i) => (
            <Icon
              key={i}
              name="star"
              size={40 * s}
              color={i <= stars ? '#D4AF37' : '#2A2A3A'}
            />
          ))}
        </View>

        {/* Moves */}
        <Text style={{
          fontFamily: 'Georgia',
          fontSize: 16 * s,
          color: 'rgba(212, 175, 55, 0.8)',
          marginTop: 15 * s,
        }}>
          Moves: {moves} / {parMoves}
        </Text>

        {/* XP */}
        <Text style={{
          fontFamily: 'Georgia',
          fontSize: 16 * s,
          color: '#D4AF37',
          marginTop: 10 * s,
        }}>
          +{xpEarned} XP
        </Text>

        {/* Coins */}
        <Text style={{
          fontFamily: 'Georgia',
          fontSize: 16 * s,
          color: '#D4AF37',
          marginTop: 6 * s,
        }}>
          +{coinsEarned} Coins
        </Text>

        {/* Buttons */}
        <View style={{ flexDirection: 'row', marginTop: 30 * s, gap: 15 * s }}>
          <TouchableOpacity
            onPress={onRestart}
            activeOpacity={0.8}
            style={{
              width: 50 * s,
              height: 50 * s,
              borderRadius: 25 * s,
              backgroundColor: 'rgba(8, 27, 58, 0.8)',
              borderWidth: 1,
              borderColor: 'rgba(212, 175, 55, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="restart" size={22 * s} color="#8B9DC3" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onHome}
            activeOpacity={0.8}
            style={{
              width: 50 * s,
              height: 50 * s,
              borderRadius: 25 * s,
              backgroundColor: 'rgba(8, 27, 58, 0.8)',
              borderWidth: 1,
              borderColor: 'rgba(212, 175, 55, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="home" size={22 * s} color="#8B9DC3" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 30 * s,
              height: 50 * s,
              borderRadius: 25 * s,
              backgroundColor: '#D4AF37',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{
              fontFamily: 'Georgia',
              fontSize: 16 * s,
              fontWeight: 'bold',
              color: '#081B3A',
            }}>
              NEXT
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
