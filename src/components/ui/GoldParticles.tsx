import React, { useEffect, useRef } from 'react';
import { Animated, useWindowDimensions, View } from 'react-native';

const PARTICLE_COUNT = 18;

const PNG_WIDTH = 853;

const BUTTON_BOUNDS = [
  { x: 53, y: 49, w: 120, h: 120 },
  { x: 515, y: 68, w: 190, h: 72 },
  { x: 718, y: 64, w: 85, h: 90 },
  { x: 36, y: 300, w: 780, h: 200 },
  { x: 36, y: 690, w: 780, h: 225 },
  { x: 36, y: 945, w: 780, h: 225 },
  { x: 36, y: 1187, w: 780, h: 225 },
  { x: 36, y: 1434, w: 780, h: 225 },
  { x: 87, y: 1698, w: 120, h: 120 },
  { x: 269, y: 1698, w: 120, h: 120 },
  { x: 465, y: 1698, w: 120, h: 120 },
  { x: 649, y: 1698, w: 120, h: 120 },
];

interface Particle {
  x: Animated.Value;
  xStart: number;
  y: Animated.Value;
  opacity: Animated.Value;
  baseOpacity: number;
  rotation: Animated.Value;
  scale: Animated.Value;
  size: number;
  speed: number;
  drift: number;
  delay: number;
}

function createParticle(width: number, height: number): Particle {
  const size = 4 + Math.random() * 8;
  const baseOpacity = 0.4 + Math.random() * 0.6;
  const xStart = Math.random() * width;
  return {
    x: new Animated.Value(xStart),
    xStart,
    y: new Animated.Value(-20 - Math.random() * 100),
    opacity: new Animated.Value(baseOpacity),
    baseOpacity,
    rotation: new Animated.Value(Math.random() * 360),
    scale: new Animated.Value(0.6 + Math.random() * 0.6),
    size,
    speed: 6000 + Math.random() * 8000,
    drift: (Math.random() - 0.5) * 120,
    delay: Math.random() * 5000,
  };
}

function isInButton(px: number, py: number, s: number): boolean {
  for (const b of BUTTON_BOUNDS) {
    const bx = b.x * s;
    const by = b.y * s;
    const bw = b.w * s;
    const bh = b.h * s;
    if (px >= bx && px <= bx + bw && py >= by && py <= by + bh) {
      return true;
    }
  }
  return false;
}

function GoldParticle({ particle, screenH, scale }: { particle: Particle; screenH: number; scale: number }) {
  const fallDuration = particle.speed;
  const swayDuration = particle.speed * 0.4;
  const hiddenRef = useRef(false);

  useEffect(() => {
    const checkVisibility = () => {
      const px = (particle.x as any)._value;
      const py = (particle.y as any)._value;
      const inside = isInButton(px, py, scale);

      if (inside && !hiddenRef.current) {
        hiddenRef.current = true;
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      } else if (!inside && hiddenRef.current) {
        hiddenRef.current = false;
        Animated.timing(particle.opacity, {
          toValue: particle.baseOpacity,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }
    };

    const xListener = particle.x.addListener(checkVisibility);
    const yListener = particle.y.addListener(checkVisibility);

    const fallCycle = () => {
      particle.y.setValue(-30);
      Animated.timing(particle.y, {
        toValue: screenH + 30,
        duration: fallDuration,
        useNativeDriver: true,
      }).start(() => fallCycle());
    };

    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(particle.x, {
          toValue: particle.xStart + particle.drift,
          duration: swayDuration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.x, {
          toValue: particle.xStart - particle.drift,
          duration: swayDuration,
          useNativeDriver: true,
        }),
      ]),
    );

    const spin = Animated.loop(
      Animated.timing(particle.rotation, {
        toValue: 360,
        duration: particle.speed * 1.5,
        useNativeDriver: true,
      }),
    );

    const startTimeout = setTimeout(() => {
      fallCycle();
      sway.start();
      spin.start();
    }, particle.delay);

    return () => {
      clearTimeout(startTimeout);
      particle.x.removeListener(xListener);
      particle.y.removeListener(yListener);
      sway.stop();
      spin.stop();
    };
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size,
        opacity: particle.opacity,
        transform: [
          { rotate: particle.rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
          { scale: particle.scale },
        ],
      }}
    >
      {/* Outer glow layer */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -particle.size * 0.6,
          left: -particle.size * 0.6,
          width: particle.size * 2.2,
          height: particle.size * 2.2,
          borderRadius: particle.size * 1.1,
          backgroundColor: 'rgba(212, 175, 55, 0.15)',
        }}
      />
      {/* Mid metallic layer */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -particle.size * 0.25,
          left: -particle.size * 0.25,
          width: particle.size * 1.5,
          height: particle.size * 1.5,
          borderRadius: particle.size * 0.75,
          backgroundColor: 'rgba(255, 215, 80, 0.35)',
        }}
      />
      {/* Core bright layer */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size * 0.5,
          backgroundColor: '#D4AF37',
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
          elevation: 6,
        }}
      />
      {/* Specular highlight */}
      <Animated.View
        style={{
          position: 'absolute',
          top: particle.size * 0.15,
          left: particle.size * 0.15,
          width: particle.size * 0.4,
          height: particle.size * 0.35,
          borderRadius: particle.size * 0.2,
          backgroundColor: 'rgba(255, 255, 220, 0.7)',
        }}
      />
    </Animated.View>
  );
}

export function GoldParticles() {
  const { width, height } = useWindowDimensions();
  const s = width / PNG_WIDTH;
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => createParticle(width, height)),
  );

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} pointerEvents="none">
      {particlesRef.current.map((p, i) => (
        <GoldParticle key={i} particle={p} screenH={height} scale={s} />
      ))}
    </View>
  );
}
