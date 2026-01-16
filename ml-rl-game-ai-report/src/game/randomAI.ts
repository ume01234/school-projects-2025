import type { Position } from './types';

/**
 * 合法手の中からランダムに1手選択
 */
export function getRandomMove(validMoves: Position[]): Position {
  if (validMoves.length === 0) {
    throw new Error('No valid moves available');
  }

  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
}
