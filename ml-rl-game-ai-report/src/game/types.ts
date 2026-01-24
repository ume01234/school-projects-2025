export type Player = 'black' | 'white' | null;
export type Board = Player[][];
export type Position = { row: number; col: number };
export type GameMode = 'blindfold1' | 'blindfold2' | 'blindfold3';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  validMoves: Position[];
  score: { black: number; white: number };
  isGameOver: boolean;
  winner: Player | 'draw';
}
