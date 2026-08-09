import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Ellipse,
  G,
  Defs,
  Stop,
  LinearGradient,
  RadialGradient,
  Text as SvgText,
} from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WIDTH = 360;
const HEIGHT = 78;
const TAB_COUNT = 4;
const TAB_WIDTH = WIDTH / TAB_COUNT;

const GOLD_HIGH = '#FFF8E1';
const GOLD_BRIGHT = '#F8EFD4';
const GOLD_MID = '#E6C36A';
const GOLD = '#D4AF37';
const GOLD_DEEP = '#B5942A';
const GOLD_DARK = '#8B7322';

const TABS = [
  { key: 'Home', label: 'Home' },
  { key: 'Quests', label: 'Quests' },
  { key: 'Collection', label: 'Collection' },
  { key: 'Profile', label: 'Profile' },
] as const;

const BAR_PATH = `
  M 0 28
  C 0 10, 16 0, 36 0
  L 324 0
  C 344 0, 360 10, 360 28
  L 360 78
  L 0 78
  Z
`;

function HomeIcon({ active }: { active: boolean }) {
  const color = active ? GOLD_HIGH : GOLD_MID;
  return (
    <G>
      {/* Palace arch / home silhouette */}
      <Path d="M -12 -2 L 0 -12 L 12 -2 L 12 10 L -12 10 Z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M -8 10 L -8 2 L 8 2 L 8 10" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M -2 10 L -2 5 L 2 5 L 2 10" fill={color} opacity={0.8} />
      <Path d="M -12 -2 L 0 -12 L 12 -2" fill="none" stroke={active ? GOLD_BRIGHT : GOLD_MID} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
}

function QuestsIcon({ active }: { active: boolean }) {
  const color = active ? GOLD_HIGH : GOLD_MID;
  return (
    <G>
      {/* Scroll / quest banner */}
      <Path d="M -9 -8 L 9 -8 L 9 8 L -9 8 Z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M -9 -8 L -7 -8 L -7 8 L -9 8" fill={color} opacity={0.6} />
      <Path d="M 9 -8 L 7 -8 L 7 8 L 9 8" fill={color} opacity={0.6} />
      <Path d="M -4 -2 L 4 -2" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M -4 2 L 2 2" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </G>
  );
}

function CollectionIcon({ active }: { active: boolean }) {
  const color = active ? GOLD_HIGH : GOLD_MID;
  return (
    <G>
      {/* Shield / medallion */}
      <Path d="M 0 -12 C 8 -8, 11 -2, 11 4 C 11 10, 4 14, 0 16 C -4 14, -11 10, -11 4 C -11 -2, -8 -8, 0 -12 Z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M 0 -8 C 5 -5, 7 -1, 7 4 C 7 8, 3 11, 0 12 C -3 11, -7 8, -7 4 C -7 -1, -5 -5, 0 -8 Z" fill={color} opacity={0.25} />
      <Path d="M 0 -4 L 0 4 M -3 0 L 3 0" stroke={active ? GOLD_BRIGHT : GOLD_MID} strokeWidth={1.5} strokeLinecap="round" />
    </G>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const color = active ? GOLD_HIGH : GOLD_MID;
  return (
    <G>
      {/* Crown / profile silhouette */}
      <Path d="M -8 9 C -8 3, -4 -1, 0 -1 C 4 -1, 8 3, 8 9 Z" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M 0 -6 L -6 -12 L -3 -3 L 0 -8 L 3 -3 L 6 -12 L 0 -6" fill={color} opacity={0.9} />
      <Path d="M -6 -9 L 6 -9" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </G>
  );
}

const ICONS: Record<(typeof TABS)[number]['key'], React.FC<{ active: boolean }>> = {
  Home: HomeIcon,
  Quests: QuestsIcon,
  Collection: CollectionIcon,
  Profile: ProfileIcon,
};

export default function BottomNavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  const activeTab = state.routes[state.index].name as (typeof TABS)[number]['key'];

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.barWrapper}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
          <Defs>
            {/* Metallic gold gradient for border */}
            <LinearGradient id="navGoldBorder" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={GOLD_DARK} />
              <Stop offset="0.2" stopColor={GOLD} />
              <Stop offset="0.4" stopColor={GOLD_BRIGHT} />
              <Stop offset="0.6" stopColor={GOLD} />
              <Stop offset="0.85" stopColor={GOLD_DEEP} />
              <Stop offset="1" stopColor={GOLD_DARK} />
            </LinearGradient>

            {/* Inner shadow gradient */}
            <LinearGradient id="navInnerShadow" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="rgba(0,0,0,0.45)" />
              <Stop offset="0.25" stopColor="rgba(0,0,0,0.12)" />
              <Stop offset="0.6" stopColor="rgba(0,0,0,0.05)" />
              <Stop offset="1" stopColor="rgba(0,0,0,0)" />
            </LinearGradient>

            {/* Active tab glow */}
            <RadialGradient id="activeTabGlow" cx="50%" cy="40%" rx="50%" ry="55%">
              <Stop offset="0" stopColor="rgba(230,195,106,0.35)" />
              <Stop offset="0.5" stopColor="rgba(230,195,106,0.12)" />
              <Stop offset="1" stopColor="rgba(230,195,106,0)" />
            </RadialGradient>

            {/* Engraved underline gradient */}
            <LinearGradient id="activeUnderline" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="rgba(212,175,55,0)" />
              <Stop offset="0.2" stopColor={GOLD_BRIGHT} />
              <Stop offset="0.5" stopColor={GOLD_HIGH} />
              <Stop offset="0.8" stopColor={GOLD_BRIGHT} />
              <Stop offset="1" stopColor="rgba(212,175,55,0)" />
            </LinearGradient>
          </Defs>

          {/* Background shape */}
          <Path d={BAR_PATH} fill="#081B3A" stroke="none" />

          {/* Inner shadow overlay */}
          <Path d={BAR_PATH} fill="url(#navInnerShadow)" stroke="none" />

          {/* Top metallic border */}
          <Path
            d="M 0 28 C 0 10, 16 0, 36 0 L 324 0 C 344 0, 360 10, 360 28"
            fill="none"
            stroke="url(#navGoldBorder)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner thin highlight line */}
          <Path
            d="M 2 28 C 2 14, 16 6, 36 6 L 324 6 C 344 6, 358 14, 358 28"
            fill="none"
            stroke={GOLD_BRIGHT}
            strokeWidth={0.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.35}
          />

          {/* Side accent lines */}
          <Path d="M 16 68 L 16 72" stroke={GOLD_DARK} strokeWidth={1} strokeLinecap="round" opacity={0.6} />
          <Path d="M 344 68 L 344 72" stroke={GOLD_DARK} strokeWidth={1} strokeLinecap="round" opacity={0.6} />

          {/* Tab glows and underlines */}
          {TABS.map((tab, index) => {
            const cx = index * TAB_WIDTH + TAB_WIDTH / 2;
            const isActive = activeTab === tab.key;
            return (
              <G key={tab.key} transform={`translate(${cx}, 0)`}>
                {isActive && (
                  <>
                    <Ellipse cx="0" cy="38" rx="34" ry="26" fill="url(#activeTabGlow)" />
                    {/* Decorative engraved underline */}
                    <Path d="M -22 58 L -14 58" stroke="url(#activeUnderline)" strokeWidth={1.8} strokeLinecap="round" />
                    <Path d="M 14 58 L 22 58" stroke="url(#activeUnderline)" strokeWidth={1.8} strokeLinecap="round" />
                    <Path d="M -3 58 L 3 58" stroke={GOLD_HIGH} strokeWidth={1.8} strokeLinecap="round" />
                    {/* Tiny crown ornament above active icon */}
                    <Path d="M 0 14 L -5 8 L 0 6 L 5 8 Z" fill={GOLD_HIGH} opacity={0.9} />
                    <Path d="M -4 16 L 4 16" stroke={GOLD_MID} strokeWidth={0.8} strokeLinecap="round" />
                  </>
                )}
              </G>
            );
          })}

          {/* Icons */}
          {TABS.map((tab, index) => {
            const cx = index * TAB_WIDTH + TAB_WIDTH / 2;
            const Icon = ICONS[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <G key={`icon-${tab.key}`} transform={`translate(${cx}, 34)`}>
                <Icon active={isActive} />
              </G>
            );
          })}

          {/* Labels */}
          {TABS.map((tab, index) => {
            const cx = index * TAB_WIDTH + TAB_WIDTH / 2;
            const isActive = activeTab === tab.key;
            return (
              <SvgText
                key={`label-${tab.key}`}
                x={cx}
                y={66}
                textAnchor="middle"
                fontFamily="Georgia"
                fontSize={10}
                fontWeight={isActive ? '700' : '600'}
                fill={isActive ? GOLD_HIGH : GOLD_MID}
                opacity={isActive ? 1 : 0.85}
                letterSpacing={0.6}
              >
                {tab.label}
              </SvgText>
            );
          })}
        </Svg>

        {/* Touch targets */}
        <View style={styles.tabsOverlay}>
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(tab.key)}
              style={styles.tabHitArea}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  barWrapper: {
    width: '100%',
    aspectRatio: WIDTH / HEIGHT,
  },
  tabsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  tabHitArea: {
    flex: 1,
  },
});
