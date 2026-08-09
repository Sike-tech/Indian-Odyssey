/** Royal Elephant game types */

export type TileType = 'empty' | 'water' | 'rock' | 'tree' | 'wall' | 'locked_gate' | 'guard';

export type ItemType = 'lotus' | 'coin' | 'exit';

export interface Position {
  row: number;
  col: number;
}

export interface LevelData {
  id: number;
  name: string;
  rows: number;
  cols: number;
  player: Position;
  exit: Position;
  lotus: Position[];
  coins: Position[];
  walls: Position[];
  water: Position[];
  rocks: Position[];
  trees: Position[];
  lockedGates: Position[];
  guards?: GuardData[];
  parMoves: number;
  tip?: string;
}

export interface GuardData {
  pos: Position;
  path: Position[];
  speed: number; // ms per step
}

export interface GameState {
  level: LevelData;
  player: Position;
  collectedLotus: Position[];
  collectedCoins: Position[];
  guards: Position[];
  guardStepIndices: number[];
  moves: number;
  selected: boolean;
  validMoves: Position[];
  status: 'playing' | 'won' | 'paused';
  hintUsed: boolean;
  undoStack: UndoEntry[];
}

export interface UndoEntry {
  player: Position;
  collectedLotus: Position[];
  collectedCoins: Position[];
  guards: Position[];
  guardStepIndices: number[];
  moves: number;
}
