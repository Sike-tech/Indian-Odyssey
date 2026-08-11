import React from 'react';
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Icon } from '../../../components/ui/Icon';

const PNG_WIDTH = 700;
const PNG_HEIGHT = 900;

const VICTORY_PNGS: Record<number, any> = {
  0: require('../../../../assets/victory-dialog-0-star.png'),
  1: require('../../../../assets/victory-dialog-1-star.png'),
  2: require('../../../../assets/victory-dialog-2-star.png'),
  3: require('../../../../assets/victory-dialog-3-star.png'),
};

interface VictoryDialogProps {
  levelNumber: number;
  moves: number;
  parMoves: number;
  allLotusCollected: boolean;
  allCoinsCollected: boolean;
  lotusesCollected: number;
  totalLotuses: number;
  coinsCollected: number;
  totalCoins: number;
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
  lotusesCollected,
  totalLotuses,
  coinsCollected,
  totalCoins,
  xpEarned,
  coinsEarned,
  onNext,
  onRestart,
  onHome,
}: VictoryDialogProps) {
  const { width: sw } = useWindowDimensions();
  const stars = allLotusCollected && allCoinsCollected && moves <= parMoves ? 3 : allLotusCollected && moves <= parMoves ? 2 : 1;

  const dialogW = sw - 70;
  const dialogH = dialogW * (PNG_HEIGHT / PNG_WIDTH);
  const s = dialogW / PNG_WIDTH;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      {/* Backdrop */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />

      {/* Dialog frame — matches PNG size/position exactly */}
      <View style={{ width: dialogW, height: dialogH, alignItems: 'center', justifyContent: 'center' }}>
        {/* Dialog PNG */}
        <Image
          source={VICTORY_PNGS[stars]}
          style={{ width: dialogW, height: dialogH }}
          resizeMode="contain"
        />

        {/* Overlay content — positions relative to PNG */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Moves */}
          <Text style={{
            position: 'absolute',
            top: 618 * s,
            left: 354 * s,
            fontFamily: 'Georgia',
            fontSize: 30 * s,
            color: 'rgba(212, 175, 55, 0.8)',
          }}>
            {moves}/{parMoves}
          </Text>

          {/* XP */}
          <Text style={{
            position: 'absolute',
            top: 496 * s,
            left: 225 * s,
            fontFamily: 'Georgia',
            fontSize: 30 * s,
            color: 'rgba(212, 175, 55, 0.8)',
          }}>
            +{xpEarned} XP
          </Text>

          {/* Coins */}
          <Text style={{
            position: 'absolute',
            top: 496 * s,
            left: 460 * s,
            fontFamily: 'Georgia',
            fontSize: 30 * s,
            color: 'rgba(212, 175, 55, 0.8)',
          }}>
            +{coinsEarned} AU
          </Text>

          {/* Lotuses collected */}
          <Text style={{
            position: 'absolute',
            top: 618 * s,
            left: 215 * s,
            fontFamily: 'Georgia',
            fontSize: 30 * s,
            color: 'rgba(212, 175, 55, 0.8)',
          }}>
            {lotusesCollected}/{totalLotuses}
          </Text>

          {/* Coins collected */}
          <Text style={{
            position: 'absolute',
            top: 618 * s,
            left: 497 * s,
            fontFamily: 'Georgia',
            fontSize: 30 * s,
            color: 'rgba(212, 175, 55, 0.7)',
          }}>
            {coinsCollected}/{totalCoins}
          </Text>

          {/* Restart Button */}
          <TouchableOpacity
            onPress={onRestart}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              top: 693 * s,
              left: 300 * s,
              width: 100 * s,
              height: 100 * s,
              borderRadius: 25 * s,
              backgroundColor: '#0000000',
              borderWidth: 0,
              borderColor: '#000000000',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="restart" size={22 * s} color="#00000000" />
          </TouchableOpacity>

          {/* Home Button */}
          <TouchableOpacity
            onPress={onHome}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              top: 693 * s,
              left: 138 * s,
              width: 100 * s,
              height: 100 * s,
              borderRadius: 25 * s,
              backgroundColor: '#000000000',
              borderWidth: 0,
              borderColor: '#000000000',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="home" size={22 * s} color="#00000000" />
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              top: 693 * s,
              left: 462 * s,
              width: 100 * s,
              height: 100 * s,
              borderRadius: 25 * s,
              backgroundColor: '#00000000',
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
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
