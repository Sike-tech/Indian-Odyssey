import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

interface BorderGlowProps {
  gridWidth: number;
  gridHeight: number;
  duration?: number;
}

/**
 * Metallic glow effect that travels around the outer border of the grid.
 */
export function BorderGlow({
  gridWidth,
  gridHeight,
  duration = 8000,
}: BorderGlowProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const pad = 4;
  const w = gridWidth + pad * 2;
  const h = gridHeight + pad * 2 - 2;

  const layers = [
    { size: 36, opacity: 0.08, bg: 'rgba(180, 150, 50, 1)' },
    { size: 26, opacity: 0.15, bg: 'rgba(160, 130, 40, 1)' },
    { size: 18, opacity: 0.3, bg: 'rgba(140, 110, 30, 1)' },
    { size: 10, opacity: 0.6, bg: 'rgba(180, 150, 50, 1)' },
    { size: 5, opacity: 1, bg: 'rgba(200, 170, 60, 1)' },
  ];

  return (
    <View
      style={{
        position: 'absolute',
        top: -pad,
        left: -pad,
        width: w,
        height: h,
      }}
      pointerEvents="none"
    >
      {layers.map((layer, i) => (
        <GlowDot
          key={i}
          progress={progress}
          w={w}
          h={h}
          layer={layer}
        />
      ))}
    </View>
  );
}

function GlowDot({
  progress,
  w,
  h,
  layer,
}: {
  progress: Animated.Value;
  w: number;
  h: number;
  layer: { size: number; opacity: number; bg: string };
}) {
  const perimeter = 2 * (w + h);

  const translateX = progress.interpolate({
    inputRange: [0, w / perimeter, (w + h) / perimeter, (2 * w + h) / perimeter, 1],
    outputRange: [0, w, w, 0, 0],
  });

  const translateY = progress.interpolate({
    inputRange: [0, w / perimeter, (w + h) / perimeter, (2 * w + h) / perimeter, 1],
    outputRange: [0, 0, h, h, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: layer.size,
        height: layer.size,
        borderRadius: layer.size / 2,
        backgroundColor: layer.bg,
        opacity: layer.opacity,
        marginLeft: -layer.size / 2,
        marginTop: -layer.size / 2,
        transform: [{ translateX }, { translateY }],
      }}
    />
  );
}
