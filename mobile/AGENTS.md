# Bharat Gyaan — React Native / Expo

A premium mobile quiz game about Indian history, culture, festivals, mythology and
geography, migrated from the original Kivy implementation to React Native +
Expo SDK 57 + TypeScript + NativeWind v4.

## Stack

- React Native 0.86.2
- Expo SDK 57
- TypeScript 6.0
- NativeWind v4 (Tailwind CSS 3.4)
- React Navigation v7 (native-stack)
- React Native Reanimated v4
- Expo Linear Gradient
- Expo Vector Icons (MaterialCommunityIcons)
- AsyncStorage for persistence

## Project Layout

- `App.tsx` — entry point, profile provider + navigation.
- `global.css` — Tailwind directives.
- `tailwind.config.js` — theme (navy/gold palette).
- `src/data/questions.ts` — 60-question bank + categories.
- `src/data/achievements.ts` — 16 achievement badges + check logic.
- `src/core/player.ts` — XP/level curve, titles, stats.
- `src/core/engine.ts` — QuizSession: 10 questions, shuffling, streaks,
  50:50 ×2, Skip ×2, lifelines, finalization.
- `src/core/storage.ts` — AsyncStorage wrapper for save/load.
- `src/hooks/useProfile.tsx` — React context for profile state.
- `src/navigation/AppNavigator.tsx` — Home / Quiz / Result / Achievements.
- `src/screens/` — screen components.
- `src/components/ui/` — reusable UI primitives (Card, GoldButton, ProgressBar, Icon).

## Commands

```bash
# Start the development server
npm run start
# or
npx expo start

# Android (needs emulator or device)
npm run android

# iOS (needs macOS + Xcode)
npm run ios

# Type check
npx tsc --noEmit

# Export Android production bundle
npx expo export --platform android
```

## Notes

- `nvm` is used to manage Node.js. Ensure it is loaded:
  `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"`.
- NativeWind requires the `babel-preset-expo` dependency to be hoisted to the
  top-level `node_modules`. It is already in `devDependencies`.
- UI is English-only; icons are from MaterialCommunityIcons.
- The original Kivy source remains in the parent directory.
