import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const CORNER_SIZE = 24;
const INSET = 24;
const STROKE_WIDTH = 1.2;
const GOLD = '#E6C36A';
const GOLD_SOFT = 'rgba(230, 195, 106, 0.5)';

function TopLeftCorner() {
  return (
    <Svg width={CORNER_SIZE} height={CORNER_SIZE} viewBox="0 0 24 24">
      <Path
        d="M 4 24 L 4 12 C 4 7 7 4 12 4 L 24 4"
        fill="none"
        stroke={GOLD}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 8 24 L 8 15 C 8 10 10 8 15 8 L 24 8"
        fill="none"
        stroke={GOLD_SOFT}
        strokeWidth={STROKE_WIDTH * 0.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="4" cy="4" r="2" fill={GOLD} />
      <Path
        d="M 4 10 C 4 6 6 4 10 4"
        fill="none"
        stroke={GOLD}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TopRightCorner() {
  return (
    <Svg width={CORNER_SIZE} height={CORNER_SIZE} viewBox="0 0 24 24">
      <Path
        d="M 20 24 L 20 12 C 20 7 17 4 12 4 L 0 4"
        fill="none"
        stroke={GOLD}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 16 24 L 16 15 C 16 10 14 8 9 8 L 0 8"
        fill="none"
        stroke={GOLD_SOFT}
        strokeWidth={STROKE_WIDTH * 0.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="20" cy="4" r="2" fill={GOLD} />
      <Path
        d="M 20 10 C 20 6 18 4 14 4"
        fill="none"
        stroke={GOLD}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BottomRightCorner() {
  return (
    <Svg width={CORNER_SIZE} height={CORNER_SIZE} viewBox="0 0 24 24">
      <Path
        d="M 20 0 L 20 12 C 20 17 17 20 12 20 L 0 20"
        fill="none"
        stroke={GOLD}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 16 0 L 16 9 C 16 14 14 16 9 16 L 0 16"
        fill="none"
        stroke={GOLD_SOFT}
        strokeWidth={STROKE_WIDTH * 0.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="20" cy="20" r="2" fill={GOLD} />
      <Path
        d="M 20 14 C 20 18 18 20 14 20"
        fill="none"
        stroke={GOLD}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BottomLeftCorner() {
  return (
    <Svg width={CORNER_SIZE} height={CORNER_SIZE} viewBox="0 0 24 24">
      <Path
        d="M 4 0 L 4 12 C 4 17 7 20 12 20 L 24 20"
        fill="none"
        stroke={GOLD}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 8 0 L 8 9 C 8 14 10 16 15 16 L 24 16"
        fill="none"
        stroke={GOLD_SOFT}
        strokeWidth={STROKE_WIDTH * 0.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="4" cy="20" r="2" fill={GOLD} />
      <Path
        d="M 4 14 C 4 18 6 20 10 20"
        fill="none"
        stroke={GOLD}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function OrnamentalBorder() {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Side lines */}
      <View style={[styles.line, styles.topLine]} />
      <View style={[styles.line, styles.bottomLine]} />
      <View style={[styles.line, styles.leftLine]} />
      <View style={[styles.line, styles.rightLine]} />

      {/* Corners */}
      <View style={[styles.corner, styles.topLeft]}>
        <TopLeftCorner />
      </View>
      <View style={[styles.corner, styles.topRight]}>
        <TopRightCorner />
      </View>
      <View style={[styles.corner, styles.bottomRight]}>
        <BottomRightCorner />
      </View>
      <View style={[styles.corner, styles.bottomLeft]}>
        <BottomLeftCorner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  line: {
    position: 'absolute',
    backgroundColor: 'rgba(230, 195, 106, 0.35)',
  },
  topLine: {
    top: INSET,
    left: INSET + CORNER_SIZE,
    right: INSET + CORNER_SIZE,
    height: 1,
  },
  bottomLine: {
    bottom: INSET,
    left: INSET + CORNER_SIZE,
    right: INSET + CORNER_SIZE,
    height: 1,
  },
  leftLine: {
    left: INSET,
    top: INSET + CORNER_SIZE,
    bottom: INSET + CORNER_SIZE,
    width: 1,
  },
  rightLine: {
    right: INSET,
    top: INSET + CORNER_SIZE,
    bottom: INSET + CORNER_SIZE,
    width: 1,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  topLeft: {
    top: INSET,
    left: INSET,
  },
  topRight: {
    top: INSET,
    right: INSET,
  },
  bottomRight: {
    bottom: INSET,
    right: INSET,
  },
  bottomLeft: {
    bottom: INSET,
    left: INSET,
  },
});
