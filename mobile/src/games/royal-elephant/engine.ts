import { LevelData, Position, GameState, UndoEntry } from './types';
import { LEVELS } from './levels';

/** Knight-move offsets: 2+1 in any L-shape */
const KNIGHT_MOVES: Position[] = [
  { row: -2, col: -1 }, { row: -2, col: 1 },
  { row: -1, col: -2 }, { row: -1, col: 2 },
  { row: 1, col: -2 },  { row: 1, col: 2 },
  { row: 2, col: -1 },  { row: 2, col: 1 },
];

/** Check if a position is within grid bounds */
function inBounds(pos: Position, rows: number, cols: number): boolean {
  return pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols;
}

/** Check if a tile is blocked (wall, water, rock, tree) */
function isBlocked(pos: Position, level: LevelData): boolean {
  const match = (arr: Position[]) => arr.some((p) => p.row === pos.row && p.col === pos.col);
  return match(level.walls) || match(level.water) || match(level.rocks) || match(level.trees);
}

/** Check if position matches any guard */
function isGuard(pos: Position, guards: Position[]): boolean {
  return guards.some((g) => g.row === pos.row && g.col === pos.col);
}

/** Check if position is a locked gate */
function isLockedGate(pos: Position, level: LevelData): boolean {
  return level.lockedGates.some((p) => p.row === pos.row && p.col === pos.col);
}

/** Check if position has a collected lotus */
function hasLotus(pos: Position, lotus: Position[]): boolean {
  return lotus.some((p) => p.row === pos.row && p.col === pos.col);
}

/** Compute all valid moves for the elephant from a given position */
export function computeValidMoves(state: GameState): Position[] {
  const { player, level, guards, collectedLotus } = state;
  const allLotusCollected = collectedLotus.length === level.lotus.length;
  const exits: Position[] = [];

  return KNIGHT_MOVES
    .map((m) => ({ row: player.row + m.row, col: player.col + m.col }))
    .filter((pos) => {
      if (!inBounds(pos, level.rows, level.cols)) return false;
      if (isBlocked(pos, level)) return false;
      if (isGuard(pos, guards)) return false;
      if (isLockedGate(pos, level)) {
        // Only passable if all lotus collected
        if (!allLotusCollected) return false;
      }
      return true;
    });
}

/** Create initial game state for a level */
export function createGameState(level: LevelData): GameState {
  const guards = level.guards?.map((g) => ({ ...g.pos })) ?? [];
  const guardStepIndices = level.guards?.map(() => 0) ?? [];

  return {
    level,
    player: { ...level.player },
    collectedLotus: [],
    collectedCoins: [],
    guards,
    guardStepIndices,
    moves: 0,
    selected: false,
    validMoves: [],
    status: 'playing',
    hintUsed: false,
    undoStack: [],
  };
}

/** Select the elephant — show valid moves */
export function selectElephant(state: GameState): GameState {
  const validMoves = computeValidMoves(state);
  return { ...state, selected: true, validMoves };
}

/** Deselect the elephant */
export function deselectElephant(state: GameState): GameState {
  return { ...state, selected: false, validMoves: [] };
}

/** Move the elephant to a target position */
export function moveElephant(state: GameState, target: Position): GameState {
  if (state.status !== 'playing') return state;

  // Verify target is valid
  const isValid = state.validMoves.some(
    (v) => v.row === target.row && v.col === target.col,
  );
  if (!isValid) return state;

  // Save undo entry
  const undo: UndoEntry = {
    player: { ...state.player },
    collectedLotus: [...state.collectedLotus],
    collectedCoins: [...state.collectedCoins],
    guards: state.guards.map((g) => ({ ...g })),
    guardStepIndices: [...state.guardStepIndices],
    moves: state.moves,
  };

  let newCollectedLotus = [...state.collectedLotus];
  let newCollectedCoins = [...state.collectedCoins];

  // Check for lotus collection
  const lotusIdx = state.level.lotus.findIndex(
    (l) => l.row === target.row && l.col === target.col,
  );
  if (lotusIdx >= 0 && !hasLotus(target, newCollectedLotus)) {
    newCollectedLotus = [...newCollectedLotus, state.level.lotus[lotusIdx]];
  }

  // Check for coin collection
  const coinIdx = state.level.coins.findIndex(
    (c) => c.row === target.row && c.col === target.col,
  );
  if (coinIdx >= 0 && !newCollectedCoins.some((c) => c.row === target.row && c.col === target.col)) {
    newCollectedCoins = [...newCollectedCoins, state.level.coins[coinIdx]];
  }

  // Check win condition
  const allLotusCollected = newCollectedLotus.length === state.level.lotus.length;
  const atExit = target.row === state.level.exit.row && target.col === state.level.exit.col;
  const won = allLotusCollected && atExit;

  return {
    ...state,
    player: { ...target },
    collectedLotus: newCollectedLotus,
    collectedCoins: newCollectedCoins,
    moves: state.moves + 1,
    selected: false,
    validMoves: [],
    status: won ? 'won' : 'playing',
    undoStack: [...state.undoStack, undo],
  };
}

/** Undo the last move */
export function undoMove(state: GameState): GameState {
  if (state.undoStack.length === 0) return state;
  const last = state.undoStack[state.undoStack.length - 1];
  return {
    ...state,
    player: last.player,
    collectedLotus: last.collectedLotus,
    collectedCoins: last.collectedCoins,
    guards: last.guards,
    guardStepIndices: last.guardStepIndices,
    moves: last.moves,
    selected: false,
    validMoves: [],
    undoStack: state.undoStack.slice(0, -1),
  };
}

/** Advance guards one step along their paths */
export function advanceGuards(state: GameState): GameState {
  if (!state.level.guards || state.level.guards.length === 0) return state;

  const newGuards = state.guards.map((g, i) => {
    const path = state.level.guards![i].path;
    const nextIdx = (state.guardStepIndices[i] + 1) % path.length;
    return { ...path[nextIdx] };
  });

  const newIndices = state.guardStepIndices.map((idx, i) => {
    return (idx + 1) % state.level.guards![i].path.length;
  });

  // Check if elephant is caught by a guard
  const caught = newGuards.some(
    (g) => g.row === state.player.row && g.col === state.player.col,
  );

  return {
    ...state,
    guards: newGuards,
    guardStepIndices: newIndices,
    status: caught ? 'paused' : state.status, // treat as "caught" — restart
  };
}

/** Get the level list */
export function getLevels(): LevelData[] {
  return LEVELS;
}

/** Get level by index (0-based) */
export function getLevel(index: number): LevelData {
  return LEVELS[Math.min(index, LEVELS.length - 1)];
}

/** Star-based coin reward */
export function calculateCoinsForStars(newStars: number, oldStars: number): number {
  const reward = [0, 25, 50, 100]; // index = star count
  if (newStars > oldStars) {
    return reward[newStars] - reward[oldStars];
  }
  return 0;
}

/** Star-based XP reward */
export function calculateXpForStars(newStars: number, oldStars: number): number {
  if (newStars > oldStars) {
    // Improvement: XP = coin difference (same as coins)
    return calculateCoinsForStars(newStars, oldStars);
  }
  // No improvement: small XP consolation
  return [0, 10, 20, 30][newStars];
}

/** Calculate star rating: 3 = all items + at/below par, 2 = all lotuses (no coins) + at/below par, 1 = completed */
export function calculateStars(level: LevelData, moves: number, collectedLotus: number, collectedCoins: number): number {
  const par = level.parMoves;
  const allLotus = collectedLotus >= level.lotus.length;
  const allCoins = collectedCoins >= level.coins.length;

  if (allLotus && allCoins && moves <= par) return 3;
  if (allLotus && moves <= par) return 2;
  return 1;
}
