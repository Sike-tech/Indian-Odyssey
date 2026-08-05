# GyaanQuest / Bharat Gyaan

A mobile quiz game about Indian history, culture, festivals, mythology and
geography, with gamification: XP, levels, streaks, achievements and lifelines.

## Branches

- **`gyaanquest/` + `main.py`** — original Kivy 2.3 + KivyMD 1.2 implementation
  (Python 3.12). Kept for reference and the existing `unittest` suite.
- **`mobile/`** — migrated production app using **React Native 0.86 + Expo SDK
  57 + TypeScript + NativeWind v4**. This is the current target for mobile
  builds.

## Kivy source (legacy)

- `main.py` — entry point; dev hooks via env vars (`GQ_AUTOSTART`,
  `GQ_SCREENSHOT`, `GQ_SHOT_DELAY`).
- `gyaanquest/data/questions.py` — question bank (60 questions, 5 categories,
  3 difficulties, each with a fun fact) + `CATEGORIES` metadata.
- `gyaanquest/core/player.py` — `PlayerProfile`: XP/level curve, titles,
  stats, JSON persistence. Level curve: `xp_to_reach(L) = 50*(L-1)*L`.
- `gyaanquest/core/engine.py` — `QuizSession`: 10 questions/game, option
  shuffling, streak multiplier (+10%/streak, cap +100%), lifelines
  (50:50 ×2, Skip ×2 per game), `finalize()` → achievements.
- `gyaanquest/core/achievements.py` — badge definitions + `check_new()`.
- `gyaanquest/ui/app.py` — KivyMD UI: Home / Quiz / Result / Achievements.
- `tests/test_core.py` — stdlib `unittest` suite for core logic (no Kivy
  needed).

## React Native / Expo source (current)

- `mobile/App.tsx` — entry point, profile provider + navigation.
- `mobile/src/data/questions.ts` — migrated 60-question bank + categories.
- `mobile/src/data/achievements.ts` — migrated 16 achievements.
- `mobile/src/core/player.ts` — migrated `PlayerProfile`.
- `mobile/src/core/engine.ts` — migrated `QuizSession`.
- `mobile/src/core/storage.ts` — AsyncStorage persistence.
- `mobile/src/navigation/AppNavigator.tsx` — Home / Quiz / Result / Achievements.
- `mobile/src/screens/` — screen components.
- `mobile/src/components/ui/` — reusable UI primitives.

See `mobile/AGENTS.md` for React Native specific commands and setup.

## Commands

```bash
# Kivy tests
.venv/bin/python -m unittest discover -s tests

# Kivy desktop run
.venv/bin/python main.py

# React Native — start Expo dev server
cd mobile
npm run start

# React Native — type check
cd mobile
npx tsc --noEmit

# React Native — export Android bundle
cd mobile
npx expo export --platform android
```

## Conventions

- UI text is English by default (do not use Hindi script in UI strings).
- New questions must have a unique id, 4 options, and a verified, concise fact.
- When modifying a source of truth (questions, achievements, level curve, etc.),
  update **both** the Kivy Python files and the React Native TypeScript files
  so the two implementations stay in sync.
- Save data is stored via AsyncStorage in the React Native app and in the app's
  `user_data_dir` for the Kivy app.
