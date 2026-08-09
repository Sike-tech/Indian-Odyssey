import React from 'react';
import { View } from 'react-native';
import { GameState, Position, ItemType, TileType } from '../types';
import { Tile } from './Tile';
import { Elephant } from './Elephant';

interface GameBoardProps {
  state: GameState;
  tileSize: number;
  tileHeightFactor?: number;
  tileWidthFactor?: number;
  hintTile?: Position;
  gateOpening?: boolean;
  onTilePress: (row: number, col: number) => void;
}

/** Determine the terrain type for a tile */
function getTerrain(row: number, col: number, state: GameState): TileType {
  const match = (arr: Position[]) => arr.some((p) => p.row === row && p.col === col);
  if (match(state.level.walls)) return 'wall';
  if (match(state.level.water)) return 'water';
  if (match(state.level.rocks)) return 'rock';
  if (match(state.level.trees)) return 'tree';
  if (match(state.level.lockedGates)) return 'locked_gate';
  return 'empty';
}

/** Determine if a tile has an item and return it */
function getItem(row: number, col: number, state: GameState): ItemType | undefined {
  if (state.level.lotus.some((p) => p.row === row && p.col === col)) return 'lotus';
  if (state.level.coins.some((p) => p.row === row && p.col === col)) return 'coin';
  return undefined;
}

export function GameBoard({ state, tileSize, tileHeightFactor = 1, tileWidthFactor = 1, hintTile, gateOpening, onTilePress }: GameBoardProps) {
  const { level, player, validMoves, selected, collectedLotus, collectedCoins, guards } = state;
  const allLotusCollected = collectedLotus.length === level.lotus.length;

  const isValidMove = (row: number, col: number) =>
    validMoves.some((v) => v.row === row && v.col === col);

  const isLotusCollected = (row: number, col: number) =>
    collectedLotus.some((p) => p.row === row && p.col === col);

  const isCoinCollected = (row: number, col: number) =>
    collectedCoins.some((c) => c.row === row && c.col === col);

  const isGuard = (row: number, col: number) =>
    guards.some((g) => g.row === row && g.col === col);

  const isHint = (row: number, col: number) =>
    hintTile !== undefined && hintTile.row === row && hintTile.col === col;

  const tileHeight = tileSize * tileHeightFactor;
  const tileWidth = tileSize * tileWidthFactor;

  return (
    <View
      style={{
        width: level.cols * tileWidth,
        height: level.rows * tileHeight,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: level.rows }, (_, row) => (
        <View key={row} style={{ flexDirection: 'row' }}>
          {Array.from({ length: level.cols }, (_, col) => {
            const isPlayer = player.row === row && player.col === col;
            const terrain = getTerrain(row, col, state);
            const item = getItem(row, col, state);

            return (
              <Tile
                key={`${row}-${col}`}
                position={{ row, col }}
                tileSize={tileSize}
                tileHeight={tileHeight}
                tileWidth={tileWidth}
                isValidMove={isValidMove(row, col)}
                isHint={isHint(row, col)}
                terrain={terrain}
                item={item}
                isExit={level.exit.row === row && level.exit.col === col}
                isPlayer={isPlayer}
                isGuard={isGuard(row, col)}
                lotusCollected={isLotusCollected(row, col)}
                coinCollected={isCoinCollected(row, col)}
                gateOpening={gateOpening}
                onPress={() => onTilePress(row, col)}
              />
            );
          })}
        </View>
      ))}

      {/* Elephant piece */}
      <Elephant
        position={player}
        tileSize={tileSize}
        tileHeight={tileHeight}
        tileWidth={tileWidth}
        selected={selected}
      />
    </View>
  );
}
