export type Player = 'black' | 'white' | null;
export type Board = Player[][];
export type Position = { row: number; col: number };
export type GameMode = 'normal' | 'blindfold1' | 'blindfold2' | 'blindfold3';
export type GamePhase = 'mode-select' | 'playing' | 'result';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  validMoves: Position[];
  score: { black: number; white: number };
  moveHistory: Move[];
  isGameOver: boolean;
  winner: Player | 'draw';
}

export interface Move {
  player: Player;
  position: Position;
  timestamp: number;
  capturedCount: number;
}

export interface GameLog {
  gameId: string;
  mode: GameMode;
  startTime: number;
  endTime: number;
  moves: Move[];
  finalScore: { black: number; white: number };
  winner: Player | 'draw';
}

export interface QuestionnaireResponse {
  gameId: string;
  nickname?: string;       // アンケートで入力（任意）
  difficulty: number;      // 1-5
  enjoyment: number;       // 1-5
  tension: number;         // 1-5
  frustration: number;     // 1-5
  playAgain: number;       // 1-5
  comments?: string;
}
