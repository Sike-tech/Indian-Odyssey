import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  G,
  Defs,
  Stop,
  LinearGradient,
  RadialGradient,
  ClipPath,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

const WIDTH = 320;
const HEIGHT = 140;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

const PLAQUE_PATH = `
  M ${CENTER_X} 10
  C 220 10, 316 30, 316 70
  C 316 110, 220 130, ${CENTER_X} 130
  C 100 130, 4 110, 4 70
  C 4 30, 100 10, ${CENTER_X} 10
  Z
`;

const GOLD_HIGH = '#FFF8E1';
const GOLD_BRIGHT = '#F8EFD4';
const GOLD_MID = '#E6C36A';
const GOLD = '#D4AF37';
const GOLD_DEEP = '#B5942A';
const GOLD_DARK = '#8B7322';
const GOLD_SHADOW = '#7A5E1A';

export default function RoyalHeroBanner() {
  return (
    <View style={styles.container} className="mx-5 mt-3">
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {/* Main metallic frame gradient */}
          <LinearGradient id="metalFrame" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={GOLD_BRIGHT} />
            <Stop offset="0.18" stopColor={GOLD_MID} />
            <Stop offset="0.32" stopColor={GOLD} />
            <Stop offset="0.42" stopColor={GOLD_HIGH} />
            <Stop offset="0.52" stopColor={GOLD_MID} />
            <Stop offset="0.68" stopColor={GOLD_DEEP} />
            <Stop offset="0.85" stopColor={GOLD_DARK} />
            <Stop offset="1" stopColor={GOLD_SHADOW} />
          </LinearGradient>

          {/* Upper rim light */}
          <LinearGradient id="rimLight" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={GOLD_HIGH} />
            <Stop offset="0.25" stopColor={GOLD_BRIGHT} />
            <Stop offset="0.55" stopColor="rgba(230,195,106,0.2)" />
            <Stop offset="1" stopColor="rgba(230,195,106,0)" />
          </LinearGradient>

          {/* Lower rim shadow */}
          <LinearGradient id="rimShadow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgba(123,94,26,0)" />
            <Stop offset="0.45" stopColor="rgba(123,94,26,0.2)" />
            <Stop offset="0.7" stopColor={GOLD_DARK} />
            <Stop offset="1" stopColor={GOLD_SHADOW} />
          </LinearGradient>

          {/* Polished gold for ornaments */}
          <LinearGradient id="polishedGold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={GOLD_BRIGHT} />
            <Stop offset="0.4" stopColor={GOLD_MID} />
            <Stop offset="0.7" stopColor={GOLD} />
            <Stop offset="1" stopColor={GOLD_DARK} />
          </LinearGradient>

          {/* Deep navy center */}
          <RadialGradient id="navyCenter" cx="50%" cy="48%" rx="58%" ry="56%">
            <Stop offset="0" stopColor="#12305E" />
            <Stop offset="0.45" stopColor="#081B3A" />
            <Stop offset="0.85" stopColor="#050E1F" />
            <Stop offset="1" stopColor="#030914" />
          </RadialGradient>

          {/* Panel vignette */}
          <RadialGradient id="panelVignette" cx="50%" cy="48%" rx="58%" ry="56%">
            <Stop offset="0" stopColor="rgba(0,0,0,0)" />
            <Stop offset="0.65" stopColor="rgba(0,0,0,0.08)" />
            <Stop offset="1" stopColor="rgba(0,0,0,0.2)" />
          </RadialGradient>

          {/* Title gold gradient */}
          <LinearGradient id="titleGold" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={GOLD_BRIGHT} />
            <Stop offset="0.25" stopColor={GOLD_MID} />
            <Stop offset="0.45" stopColor={GOLD} />
            <Stop offset="0.55" stopColor={GOLD_HIGH} />
            <Stop offset="0.65" stopColor={GOLD_MID} />
            <Stop offset="0.85" stopColor={GOLD_DEEP} />
            <Stop offset="1" stopColor={GOLD_DARK} />
          </LinearGradient>

          {/* Title specular highlight */}
          <LinearGradient id="titleSpecular" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgba(255,248,225,0)" />
            <Stop offset="0.42" stopColor="rgba(255,248,225,0)" />
            <Stop offset="0.5" stopColor="rgba(255,248,225,0.5)" />
            <Stop offset="0.58" stopColor="rgba(255,248,225,0)" />
            <Stop offset="1" stopColor="rgba(255,248,225,0)" />
          </LinearGradient>

          {/* Inner shadow for engraving */}
          <LinearGradient id="innerShadow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgba(30,20,5,0.75)" />
            <Stop offset="0.25" stopColor="rgba(30,20,5,0.2)" />
            <Stop offset="0.55" stopColor="rgba(30,20,5,0)" />
            <Stop offset="0.85" stopColor="rgba(30,20,5,0.3)" />
            <Stop offset="1" stopColor="rgba(30,20,5,0.65)" />
          </LinearGradient>

          {/* Soft ambient glow */}
          <RadialGradient id="ambientGlow" cx="50%" cy="45%" rx="55%" ry="55%">
            <Stop offset="0" stopColor="rgba(230,195,106,0.16)" />
            <Stop offset="0.5" stopColor="rgba(230,195,106,0.05)" />
            <Stop offset="1" stopColor="rgba(230,195,106,0)" />
          </RadialGradient>

          {/* Lotus petal gradients */}
          <LinearGradient id="lotusOuter" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={GOLD_HIGH} />
            <Stop offset="0.35" stopColor={GOLD_MID} />
            <Stop offset="0.75" stopColor={GOLD_DEEP} />
            <Stop offset="1" stopColor={GOLD_DARK} />
          </LinearGradient>

          <LinearGradient id="lotusInner" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={GOLD_BRIGHT} />
            <Stop offset="0.5" stopColor={GOLD} />
            <Stop offset="1" stopColor={GOLD_DARK} />
          </LinearGradient>

          {/* Half-screen clips */}
          <ClipPath id="topHalf">
            <Rect x="0" y="0" width={WIDTH} height={HEIGHT / 2} />
          </ClipPath>
          <ClipPath id="bottomHalf">
            <Rect x="0" y={HEIGHT / 2} width={WIDTH} height={HEIGHT / 2} />
          </ClipPath>
        </Defs>

        {/* Soft ambient glow behind plaque */}
        <Ellipse
          cx={CENTER_X}
          cy={CENTER_Y}
          rx={WIDTH / 2 + 14}
          ry={HEIGHT / 2 + 10}
          fill="url(#ambientGlow)"
          opacity={0.7}
        />

        {/* Directional drop shadow for elevation */}
        <Path
          d={PLAQUE_PATH}
          fill="rgba(0,0,0,0.35)"
          stroke="none"
          transform="translate(2, 3)"
          opacity={0.5}
        />

        {/* Navy center panel */}
        <Path d={PLAQUE_PATH} fill="url(#navyCenter)" stroke="none" />

        {/* Panel vignette */}
        <Path
          d={PLAQUE_PATH}
          fill="url(#panelVignette)"
          stroke="none"
          opacity={0.7}
        />

        {/* Subtle mandala texture */}
        <G opacity={0.03}>
          <Circle cx={CENTER_X} cy={CENTER_Y - 2} r="52" fill="none" stroke={GOLD_MID} strokeWidth={0.8} />
          <Circle cx={CENTER_X} cy={CENTER_Y - 2} r="40" fill="none" stroke={GOLD_MID} strokeWidth={0.7} />
          <Circle cx={CENTER_X} cy={CENTER_Y - 2} r="28" fill="none" stroke={GOLD_MID} strokeWidth={0.6} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <Path
                key={i}
                d={`M ${CENTER_X} ${CENTER_Y - 2} L ${CENTER_X + 54 * Math.cos(a)} ${CENTER_Y - 2 + 54 * Math.sin(a)}`}
                stroke={GOLD_MID}
                strokeWidth={0.5}
              />
            );
          })}
        </G>

        {/* Small lotus ornament above title */}
        <G transform={`translate(${CENTER_X}, 34) scale(0.2)`}>
          <Circle cx="0" cy="0" r="28" fill="rgba(230,195,106,0.12)" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <G key={`o-${a}`} transform={`rotate(${a})`}>
              <Path
                d="M 0 0 C -6 -10 -8 -18 -5 -26 C 0 -30 5 -26 8 -18 C 6 -10 0 0 0 0 Z"
                fill="url(#lotusOuter)"
                opacity={0.95}
              />
            </G>
          ))}
          {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((a) => (
            <G key={`m-${a}`} transform={`rotate(${a})`}>
              <Path
                d="M 0 0 C -8 -8 -10 -16 -6 -22 C 0 -26 6 -22 10 -16 C 8 -8 0 0 0 0 Z"
                fill="url(#lotusInner)"
                opacity={0.85}
              />
            </G>
          ))}
          <Circle cx="0" cy="0" r="5" fill="url(#polishedGold)" />
          <Path d="M 0 2 C -2.5 -1 -2.5 -5 0 -7 C 2.5 -5 2.5 -1 0 2 Z" fill={GOLD_HIGH} />
          <Circle cx="0" cy="-2" r="1.5" fill={GOLD_MID} />
        </G>

        {/* Subtitle */}
        <G transform={`translate(${CENTER_X}, 104)`}>
          <SvgText
            x="0"
            y="0"
            textAnchor="middle"
            fontFamily="Georgia"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.4"
            fill={GOLD_MID}
            opacity={0.9}
          >
            A JOURNEY THROUGH OUR HERITAGE
          </SvgText>
        </G>

        {/* Embossed title */}
        <G transform={`translate(${CENTER_X}, 72)`}>
          {/* Drop shadow */}
          <SvgText
            x="1.5"
            y="1.5"
            textAnchor="middle"
            fontFamily="Georgia"
            fontSize="28"
            fontWeight="900"
            letterSpacing="0.5"
            fill="rgba(10,7,2,0.5)"
          >
            BHARAT GYAAN
          </SvgText>
          {/* Inner shadow */}
          <SvgText
            x="-1"
            y="-1"
            textAnchor="middle"
            fontFamily="Georgia"
            fontSize="28"
            fontWeight="900"
            letterSpacing="0.5"
            fill="url(#innerShadow)"
          >
            BHARAT GYAAN
          </SvgText>
          {/* Main gold body */}
          <SvgText
            x="0"
            y="0"
            textAnchor="middle"
            fontFamily="Georgia"
            fontSize="28"
            fontWeight="900"
            letterSpacing="0.5"
            fill="url(#titleGold)"
          >
            BHARAT GYAAN
          </SvgText>
          {/* Specular highlight */}
          <SvgText
            x="0"
            y="0"
            textAnchor="middle"
            fontFamily="Georgia"
            fontSize="28"
            fontWeight="900"
            letterSpacing="0.5"
            fill="url(#titleSpecular)"
          >
            BHARAT GYAAN
          </SvgText>
          {/* Top highlight */}
          <SvgText
            x="-0.5"
            y="-0.5"
            textAnchor="middle"
            fontFamily="Georgia"
            fontSize="28"
            fontWeight="900"
            letterSpacing="0.5"
            fill={GOLD_HIGH}
            opacity={0.5}
          >
            BHARAT GYAAN
          </SvgText>
        </G>

        {/* Bottom ornamental divider */}
        <G transform={`translate(${CENTER_X}, 116)`} opacity={0.85}>
          <Path d="M -28 0 L -8 0" stroke="url(#polishedGold)" strokeWidth={0.7} strokeLinecap="round" />
          <Path d="M 8 0 L 28 0" stroke="url(#polishedGold)" strokeWidth={0.7} strokeLinecap="round" />
          <Path d="M -2 0 L 2 0" stroke={GOLD_BRIGHT} strokeWidth={1.2} strokeLinecap="round" />
          <Circle cx="-6" cy="0" r="1.2" fill="url(#polishedGold)" />
          <Circle cx="6" cy="0" r="1.2" fill="url(#polishedGold)" />
        </G>

        {/* Corner diamonds */}
        <G>
          <Path d="M 30 44 L 34 40 L 38 44 L 34 48 Z" fill="url(#polishedGold)" />
          <Path d="M 282 44 L 286 40 L 290 44 L 286 48 Z" fill="url(#polishedGold)" />
          <Path d="M 30 96 L 34 92 L 38 96 L 34 100 Z" fill="url(#polishedGold)" />
          <Path d="M 282 96 L 286 92 L 290 96 L 286 100 Z" fill="url(#polishedGold)" />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 18,
    aspectRatio: WIDTH / HEIGHT,
  },
});
