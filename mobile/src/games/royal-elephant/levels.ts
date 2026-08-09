import { LevelData } from './types';

/** All Royal Elephant levels — easy → hard */
export const LEVELS: LevelData[] = [
  // ── Level 1: Tutorial (5×5) ──
  // all-items: 6, lotus-only: 4
  {
    id: 1,
    name: 'Temple Garden',
    rows: 5,
    cols: 5,
    player: { row: 0, col: 0 },
    exit: { row: 4, col: 4 },
    lotus: [{ row: 1, col: 2 }, { row: 3, col: 1 }],
    coins: [{ row: 2, col: 4 }],
    walls: [{ row: 1, col: 1 }],
    water: [],
    rocks: [],
    trees: [],
    lockedGates: [],
    parMoves: 6,
    tip: 'Tap then elephant and then a highlighted tile to move. Collect all lotuses and coins for 3 stars!',
  },
  // ── Level 2: Simple (5×5) ──
  // all-items: 10, lotus-only: 6
  {
    id: 2,
    name: 'Stone Path',
    rows: 5,
    cols: 5,
    player: { row: 0, col: 0 },
    exit: { row: 4, col: 4 },
    lotus: [{ row: 1, col: 2 }, { row: 3, col: 1 }, { row: 2, col: 4 }],
    coins: [{ row: 0, col: 3 }, { row: 4, col: 2 }],
    walls: [{ row: 2, col: 2 }],
    water: [{ row: 1, col: 3 }],
    rocks: [],
    trees: [],
    lockedGates: [],
    parMoves: 10,
    tip: 'You cannot land on walls or water. Plan your knight moves carefully!',
  },
  // ── Level 3: Water (5×5) ──
  // all-items: 14, lotus-only: 10
  {
    id: 3,
    name: 'Lotus Pond',
    rows: 5,
    cols: 5,
    player: { row: 0, col: 0 },
    exit: { row: 4, col: 4 },
    lotus: [{ row: 1, col: 3 }, { row: 3, col: 1 }, { row: 2, col: 4 }],
    coins: [{ row: 0, col: 1 }, { row: 4, col: 0 }],
    walls: [],
    water: [{ row: 1, col: 2 }, { row: 2, col: 2 }, { row: 2, col: 3 }],
    rocks: [{ row: 3, col: 3 }],
    trees: [],
    lockedGates: [],
    parMoves: 14,
    tip: 'Water blocks your path. Rocks are solid and cannot be crossed.',
  },
  // ── Level 4: Forest (5×5) ──
  // all-items: 12, lotus-only: 12
  {
    id: 4,
    name: 'Forest Trail',
    rows: 5,
    cols: 5,
    player: { row: 2, col: 0 },
    exit: { row: 2, col: 4 },
    lotus: [{ row: 0, col: 2 }, { row: 1, col: 4 }, { row: 4, col: 1 }],
    coins: [{ row: 0, col: 4 }, { row: 4, col: 3 }],
    walls: [],
    water: [],
    rocks: [{ row: 2, col: 2 }],
    trees: [{ row: 1, col: 1 }, { row: 3, col: 3 }],
    lockedGates: [],
    parMoves: 12,
    tip: 'Trees and rocks block movement. Use the undo button if you get stuck!',
  },
  // ── Level 5: Locked Gate (5×5) ──
  // all-items: 10, lotus-only: 8
  {
    id: 5,
    name: 'Sealed Shrine',
    rows: 5,
    cols: 5,
    player: { row: 0, col: 0 },
    exit: { row: 4, col: 4 },
    lotus: [{ row: 0, col: 2 }, { row: 2, col: 0 }, { row: 3, col: 3 }],
    coins: [{ row: 1, col: 4 }, { row: 4, col: 2 }],
    walls: [{ row: 2, col: 2 }],
    water: [{ row: 3, col: 1 }],
    rocks: [],
    trees: [],
    lockedGates: [{ row: 3, col: 4 }],
    parMoves: 10,
    tip: 'Locked gates block your path. Collect coins and lotuses for bonus stars!',
  },
  // ── Level 6: 6×6 ──
  // all-items: 14, lotus-only: 8
  {
    id: 6,
    name: 'Royal Court',
    rows: 6,
    cols: 6,
    player: { row: 0, col: 0 },
    exit: { row: 5, col: 5 },
    lotus: [
      { row: 1, col: 3 }, { row: 3, col: 1 }, { row: 4, col: 4 },
      { row: 2, col: 5 },
    ],
    coins: [{ row: 0, col: 4 }, { row: 5, col: 1 }, { row: 3, col: 3 }],
    walls: [{ row: 2, col: 2 }, { row: 3, col: 4 }],
    water: [{ row: 1, col: 1 }],
    rocks: [],
    trees: [],
    lockedGates: [],
    parMoves: 14,
    tip: 'Use the hint button if you need guidance on your next move!',
  },
  // ── Level 7: 6×6 with guards ──
  // all-items: 12, lotus-only: 12
  {
    id: 7,
    name: 'Guarded Palace',
    rows: 6,
    cols: 6,
    player: { row: 0, col: 0 },
    exit: { row: 5, col: 5 },
    lotus: [
      { row: 0, col: 4 }, { row: 3, col: 0 }, { row: 5, col: 2 },
      { row: 2, col: 5 },
    ],
    coins: [{ row: 1, col: 2 }, { row: 4, col: 3 }],
    walls: [{ row: 3, col: 3 }],
    water: [{ row: 2, col: 2 }],
    rocks: [{ row: 4, col: 1 }],
    trees: [],
    lockedGates: [],
    guards: [
      { pos: { row: 1, col: 4 }, path: [{ row: 1, col: 4 }, { row: 3, col: 4 }], speed: 1500 },
    ],
    parMoves: 12,
    tip: 'Guards patrol back and forth. Avoid their path or you will be sent back!',
  },
  // ── Level 8: 7×7 ──
  // all-items: 14, lotus-only: 10
  {
    id: 8,
    name: 'Temple Maze',
    rows: 7,
    cols: 7,
    player: { row: 0, col: 0 },
    exit: { row: 6, col: 6 },
    lotus: [
      { row: 1, col: 2 }, { row: 2, col: 5 }, { row: 4, col: 1 },
      { row: 5, col: 4 }, { row: 3, col: 6 },
    ],
    coins: [
      { row: 0, col: 3 }, { row: 6, col: 0 }, { row: 3, col: 3 },
    ],
    walls: [
      { row: 1, col: 1 }, { row: 2, col: 3 }, { row: 4, col: 3 },
      { row: 5, col: 5 },
    ],
    water: [{ row: 2, col: 1 }, { row: 3, col: 1 }],
    rocks: [{ row: 4, col: 5 }],
    trees: [{ row: 1, col: 4 }, { row: 5, col: 2 }],
    lockedGates: [{ row: 5, col: 6 }],
    parMoves: 14,
    tip: 'Larger grids need more planning. Think several moves ahead!',
  },
  // ── Level 9: 7×7 ──
  // all-items: 16, lotus-only: 12
  {
    id: 9,
    name: 'Fortress',
    rows: 7,
    cols: 7,
    player: { row: 0, col: 0 },
    exit: { row: 6, col: 6 },
    lotus: [
      { row: 0, col: 5 }, { row: 2, col: 1 }, { row: 4, col: 3 },
      { row: 6, col: 5 },
    ],
    coins: [
      { row: 1, col: 4 }, { row: 5, col: 0 }, { row: 3, col: 6 },
    ],
    walls: [
      { row: 2, col: 3 }, { row: 4, col: 5 },
    ],
    water: [{ row: 3, col: 2 }],
    rocks: [],
    trees: [],
    lockedGates: [],
    parMoves: 16,
    tip: 'Balance speed and collection. Fewer moves means higher stars!',
  },
  // ── Level 10: 8×8 ──
  // all-items: 18, lotus-only: 16
  {
    id: 10,
    name: 'Grand Temple',
    rows: 8,
    cols: 8,
    player: { row: 0, col: 0 },
    exit: { row: 7, col: 7 },
    lotus: [
      { row: 0, col: 4 }, { row: 2, col: 2 }, { row: 4, col: 5 },
      { row: 6, col: 1 }, { row: 7, col: 4 },
    ],
    coins: [
      { row: 1, col: 6 }, { row: 3, col: 0 }, { row: 5, col: 3 },
      { row: 7, col: 2 },
    ],
    walls: [
      { row: 1, col: 3 }, { row: 3, col: 4 }, { row: 5, col: 2 },
      { row: 2, col: 6 },
    ],
    water: [
      { row: 2, col: 4 }, { row: 1, col: 5 },
    ],
    rocks: [{ row: 3, col: 3 }],
    trees: [],
    lockedGates: [],
    parMoves: 18,
    tip: 'The biggest challenge yet. Collect everything for 3 stars!',
  },
  // ── Level 11: 5×5 harder ──
  // all-items: 12, lotus-only: 12
  {
    id: 11,
    name: 'Bamboo Maze',
    rows: 5,
    cols: 5,
    player: { row: 0, col: 2 },
    exit: { row: 4, col: 2 },
    lotus: [{ row: 0, col: 0 }, { row: 2, col: 4 }, { row: 4, col: 0 }],
    coins: [{ row: 1, col: 2 }, { row: 3, col: 2 }],
    walls: [{ row: 2, col: 1 }, { row: 2, col: 3 }],
    water: [{ row: 1, col: 0 }],
    rocks: [],
    trees: [],
    lockedGates: [],
    parMoves: 12,
    tip: 'Tight spaces require precise knight moves. Watch your step!',
  },
  // ── Level 12: 5×5 wall maze ──
  // all-items: 12, lotus-only: 8
  {
    id: 12,
    name: 'Temple Corridors',
    rows: 5,
    cols: 5,
    player: { row: 4, col: 0 },
    exit: { row: 0, col: 4 },
    lotus: [{ row: 0, col: 2 }, { row: 2, col: 0 }, { row: 4, col: 4 }],
    coins: [{ row: 1, col: 4 }, { row: 3, col: 0 }],
    walls: [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 3 }],
    water: [],
    rocks: [],
    trees: [],
    lockedGates: [],
    parMoves: 12,
    tip: 'Walls create narrow corridors. Find the right path through!',
  },
  // ── Level 13: 6×6 harder ──
  // all-items: 18, lotus-only: 14
  {
    id: 13,
    name: 'Mountain Pass',
    rows: 6,
    cols: 6,
    player: { row: 5, col: 0 },
    exit: { row: 0, col: 5 },
    lotus: [
      { row: 0, col: 1 }, { row: 2, col: 3 }, { row: 4, col: 0 },
      { row: 5, col: 5 },
    ],
    coins: [{ row: 1, col: 5 }, { row: 3, col: 2 }, { row: 5, col: 3 }],
    walls: [{ row: 1, col: 2 }, { row: 3, col: 4 }, { row: 4, col: 2 }],
    water: [{ row: 2, col: 1 }, { row: 4, col: 5 }],
    rocks: [],
    trees: [],
    lockedGates: [],
    parMoves: 18,
    tip: 'Water and walls together create tricky obstacles. Stay focused!',
  },
  // ── Level 14: 6×6 complex ──
  // all-items: 16, lotus-only: 12
  {
    id: 14,
    name: 'Desert Ruins',
    rows: 6,
    cols: 6,
    player: { row: 0, col: 3 },
    exit: { row: 5, col: 2 },
    lotus: [
      { row: 0, col: 0 }, { row: 2, col: 5 }, { row: 4, col: 1 },
      { row: 5, col: 4 },
    ],
    coins: [{ row: 1, col: 1 }, { row: 3, col: 3 }, { row: 5, col: 0 }],
    walls: [{ row: 1, col: 4 }, { row: 3, col: 1 }, { row: 4, col: 3 }],
    water: [{ row: 2, col: 2 }, { row: 4, col: 5 }],
    rocks: [{ row: 3, col: 5 }],
    trees: [],
    lockedGates: [],
    parMoves: 16,
    tip: 'Rocks are permanent obstacles. Plan routes around them!',
  },
  // ── Level 15: 7×7 final challenge ──
  // all-items: 18, lotus-only: 10
  {
    id: 15,
    name: 'Elephant Graveyard',
    rows: 7,
    cols: 7,
    player: { row: 3, col: 0 },
    exit: { row: 3, col: 6 },
    lotus: [
      { row: 0, col: 2 }, { row: 1, col: 5 }, { row: 3, col: 3 },
      { row: 5, col: 1 }, { row: 6, col: 4 },
    ],
    coins: [
      { row: 0, col: 6 }, { row: 2, col: 0 }, { row: 4, col: 4 },
      { row: 6, col: 2 },
    ],
    walls: [
      { row: 1, col: 3 }, { row: 3, col: 1 }, { row: 5, col: 3 },
    ],
    water: [{ row: 2, col: 2 }, { row: 4, col: 2 }],
    rocks: [{ row: 4, col: 6 }],
    trees: [{ row: 2, col: 4 }, { row: 4, col: 0 }],
    lockedGates: [],
    parMoves: 18,
    tip: 'The final test of your knight skills. Master all obstacles to win!',
  },
  // ── Level 16: 7×7 dual guards ──
  {
    id: 16,
    name: 'Twin Guardians',
    rows: 7,
    cols: 7,
    player: { row: 0, col: 0 },
    exit: { row: 6, col: 6 },
    lotus: [
      { row: 1, col: 5 }, { row: 3, col: 2 }, { row: 5, col: 5 },
      { row: 6, col: 1 },
    ],
    coins: [
      { row: 0, col: 3 }, { row: 2, col: 6 }, { row: 4, col: 0 },
      { row: 6, col: 4 },
    ],
    walls: [
      { row: 1, col: 2 }, { row: 3, col: 4 }, { row: 5, col: 2 },
    ],
    water: [{ row: 2, col: 3 }, { row: 4, col: 3 }],
    rocks: [{ row: 3, col: 0 }],
    trees: [],
    lockedGates: [{ row: 5, col: 6 }],
    guards: [
      { pos: { row: 0, col: 5 }, path: [{ row: 0, col: 5 }, { row: 0, col: 1 }], speed: 1200 },
      { pos: { row: 6, col: 2 }, path: [{ row: 6, col: 2 }, { row: 6, col: 5 }], speed: 1400 },
    ],
    parMoves: 20,
    tip: 'Two guards patrol opposite rows. Time your moves between their passes!',
  },
  // ── Level 17: 8×8 winding path ──
  {
    id: 17,
    name: 'Serpent Trail',
    rows: 8,
    cols: 8,
    player: { row: 0, col: 0 },
    exit: { row: 7, col: 7 },
    lotus: [
      { row: 1, col: 3 }, { row: 3, col: 6 }, { row: 5, col: 1 },
      { row: 7, col: 4 },
    ],
    coins: [
      { row: 0, col: 5 }, { row: 2, col: 2 }, { row: 4, col: 7 },
      { row: 6, col: 3 },
    ],
    walls: [
      { row: 1, col: 1 }, { row: 2, col: 4 }, { row: 4, col: 2 },
      { row: 5, col: 5 }, { row: 6, col: 0 },
    ],
    water: [
      { row: 3, col: 3 }, { row: 5, col: 3 },
    ],
    rocks: [{ row: 2, col: 6 }, { row: 6, col: 6 }],
    trees: [{ row: 1, col: 6 }, { row: 7, col: 2 }],
    lockedGates: [],
    parMoves: 20,
    tip: 'Walls and rocks force a winding path. Find the efficient route!',
  },
  // ── Level 18: 8×8 triple guards ──
  {
    id: 18,
    name: 'Shadow Protocol',
    rows: 8,
    cols: 8,
    player: { row: 7, col: 0 },
    exit: { row: 0, col: 7 },
    lotus: [
      { row: 0, col: 2 }, { row: 2, col: 5 }, { row: 4, col: 0 },
      { row: 6, col: 3 },
    ],
    coins: [
      { row: 1, col: 7 }, { row: 3, col: 1 }, { row: 5, col: 6 },
      { row: 7, col: 4 },
    ],
    walls: [
      { row: 1, col: 3 }, { row: 3, col: 5 }, { row: 5, col: 3 },
      { row: 6, col: 7 },
    ],
    water: [{ row: 2, col: 2 }, { row: 4, col: 4 }],
    rocks: [{ row: 3, col: 7 }],
    trees: [],
    lockedGates: [{ row: 0, col: 6 }],
    guards: [
      { pos: { row: 2, col: 0 }, path: [{ row: 2, col: 0 }, { row: 2, col: 7 }], speed: 1000 },
      { pos: { row: 4, col: 7 }, path: [{ row: 4, col: 7 }, { row: 4, col: 0 }], speed: 1100 },
      { pos: { row: 6, col: 0 }, path: [{ row: 6, col: 0 }, { row: 6, col: 7 }], speed: 1300 },
    ],
    parMoves: 22,
    tip: 'Three guards patrol horizontally. Study their patterns and slip through!',
  },
  // ── Level 19: 8×8 fortress ──
  {
    id: 19,
    name: 'Iron Bastion',
    rows: 8,
    cols: 8,
    player: { row: 0, col: 0 },
    exit: { row: 7, col: 7 },
    lotus: [
      { row: 1, col: 4 }, { row: 3, col: 1 }, { row: 5, col: 6 },
      { row: 7, col: 3 },
    ],
    coins: [
      { row: 0, col: 6 }, { row: 2, col: 3 }, { row: 4, col: 0 },
      { row: 6, col: 5 },
    ],
    walls: [
      { row: 1, col: 2 }, { row: 2, col: 5 }, { row: 4, col: 3 },
      { row: 5, col: 0 }, { row: 6, col: 7 },
    ],
    water: [
      { row: 3, col: 4 }, { row: 5, col: 2 },
    ],
    rocks: [{ row: 2, col: 7 }, { row: 6, col: 1 }],
    trees: [{ row: 1, col: 6 }, { row: 7, col: 1 }],
    lockedGates: [{ row: 7, col: 6 }],
    guards: [
      { pos: { row: 0, col: 5 }, path: [{ row: 0, col: 5 }, { row: 0, col: 1 }], speed: 1200 },
      { pos: { row: 7, col: 2 }, path: [{ row: 7, col: 2 }, { row: 7, col: 5 }], speed: 1200 },
    ],
    parMoves: 24,
    tip: 'Locked gates guard the exit. Collect all lotuses to unlock the path!',
  },
  // ── Level 20: 8×8 grand finale ──
  {
    id: 20,
    name: 'The Final Throne',
    rows: 8,
    cols: 8,
    player: { row: 7, col: 0 },
    exit: { row: 0, col: 7 },
    lotus: [
      { row: 0, col: 1 }, { row: 2, col: 4 }, { row: 4, col: 7 },
      { row: 6, col: 2 },
    ],
    coins: [
      { row: 1, col: 6 }, { row: 3, col: 3 }, { row: 5, col: 0 },
      { row: 7, col: 5 },
    ],
    walls: [
      { row: 1, col: 1 }, { row: 2, col: 3 }, { row: 3, col: 6 },
      { row: 5, col: 3 }, { row: 6, col: 5 },
    ],
    water: [
      { row: 2, col: 6 }, { row: 4, col: 2 }, { row: 6, col: 4 },
    ],
    rocks: [{ row: 3, col: 1 }, { row: 5, col: 7 }],
    trees: [{ row: 1, col: 4 }, { row: 7, col: 3 }],
    lockedGates: [{ row: 0, col: 6 }],
    guards: [
      { pos: { row: 1, col: 0 }, path: [{ row: 1, col: 0 }, { row: 1, col: 7 }], speed: 900 },
      { pos: { row: 3, col: 7 }, path: [{ row: 3, col: 7 }, { row: 3, col: 0 }], speed: 1000 },
      { pos: { row: 5, col: 0 }, path: [{ row: 5, col: 0 }, { row: 5, col: 7 }], speed: 1100 },
    ],
    parMoves: 24,
    tip: 'The ultimate challenge. Every move counts. Can you claim the throne?',
  },
];
