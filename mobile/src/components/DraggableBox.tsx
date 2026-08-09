import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  StyleSheet,
} from 'react-native';

const HANDLE_SIZE = 14;
const MIN_SIZE = 20;

type BoxRect = { x: number; y: number; w: number; h: number };
type ContentRect = { x: number; y: number; width: number; height: number; scale: number };

type Props = {
  id: string;
  rect: BoxRect;
  onMove: (id: string, rect: BoxRect) => void;
  contentRect: ContentRect;
};

export default function DraggableBox({ id, rect, onMove, contentRect }: Props) {
  const [label, setLabel] = useState('');
  const { x: ox, y: oy, scale } = contentRect;

  // ── main-box pan ──────────────────────────────────────────────
  const boxPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_e: GestureResponderEvent, g: PanResponderGestureState) => {
        onMove(id, {
          x: Math.round(rect.x + g.dx / scale),
          y: Math.round(rect.y + g.dy / scale),
          w: rect.w,
          h: rect.h,
        });
      },
    }),
  ).current;

  // ── handle helpers ────────────────────────────────────────────
  const makeHandlePan = (
    corner: 'tl' | 'tr' | 'bl' | 'br',
  ) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_e: GestureResponderEvent, g: PanResponderGestureState) => {
        const dx = g.dx / scale;
        const dy = g.dy / scale;
        let { x, y, w, h } = rect;
        if (corner.includes('l')) { x += dx; w -= dx; }
        if (corner.includes('r')) { w += dx; }
        if (corner.includes('t')) { y += dy; h -= dy; }
        if (corner.includes('b')) { h += dy; }
        w = Math.max(MIN_SIZE, w);
        h = Math.max(MIN_SIZE, h);
        onMove(id, {
          x: Math.round(x),
          y: Math.round(y),
          w: Math.round(w),
          h: Math.round(h),
        });
      },
    });

  const tlPan = useRef(makeHandlePan('tl')).current;
  const trPan = useRef(makeHandlePan('tr')).current;
  const blPan = useRef(makeHandlePan('bl')).current;
  const brPan = useRef(makeHandlePan('br')).current;

  const handleLabel = () => {
    setLabel(`x:${rect.x} y:${rect.y} w:${rect.w} h:${rect.h}`);
  };
  const clearLabel = () => setLabel('');

  return (
    <View style={{ position: 'absolute', left: 0, top: 0 }}>
      {/* draggable body */}
      <View
        {...boxPan.panHandlers}
        onLayout={handleLabel}
        style={{
          position: 'absolute',
          left: ox + rect.x * scale,
          top: oy + rect.y * scale,
          width: rect.w * scale,
          height: rect.h * scale,
          backgroundColor: 'rgba(255,0,0,0.22)',
          borderColor: 'rgba(255,0,0,0.85)',
          borderWidth: 1,
          borderRadius: 6,
        }}
      />

      {/* coordinate label */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: ox + rect.x * scale,
          top: oy + rect.y * scale - 20,
        }}
      >
        <Text style={styles.coordLabel}>{label}</Text>
      </View>

      {/* resize handles */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => {
        const pan = corner === 'tl' ? tlPan : corner === 'tr' ? trPan : corner === 'bl' ? blPan : brPan;
        const left =
          corner.includes('l')
            ? ox + rect.x * scale - HANDLE_SIZE / 2
            : ox + rect.x * scale + rect.w * scale - HANDLE_SIZE / 2;
        const top =
          corner.includes('t')
            ? oy + rect.y * scale - HANDLE_SIZE / 2
            : oy + rect.y * scale + rect.h * scale - HANDLE_SIZE / 2;
        return (
          <View
            key={corner}
            {...pan.panHandlers}
            style={{
              position: 'absolute',
              left,
              top,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              backgroundColor: '#FFD700',
              borderColor: '#000',
              borderWidth: 1,
              borderRadius: 3,
              zIndex: 10,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  coordLabel: {
    color: '#FFD700',
    fontSize: 9,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
  },
});
