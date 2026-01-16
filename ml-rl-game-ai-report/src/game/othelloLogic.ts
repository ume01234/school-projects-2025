import type { Board, Player, Position } from './types';

const BOARD_SIZE = 8;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

/**
 * 初期盤面を生成
 */
export function createInitialBoard(): Board {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() =>
    Array(BOARD_SIZE).fill(null)
  );

  // 中央の4マスに初期配置
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';

  return board;
}

/**
 * 相手のプレイヤーを取得
 */
function getOpponent(player: Player): Player {
  return player === 'black' ? 'white' : 'black';
}

/**
 * 指定位置が盤面内かチェック
 */
function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * 指定方向に石を反転できるかチェックし、反転できる石の位置を返す
 */
function getFlippablePiecesInDirection(
  board: Board,
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  player: Player
): Position[] {
  const opponent = getOpponent(player);
  const flippable: Position[] = [];
  let currentRow = row + dRow;
  let currentCol = col + dCol;

  // 隣接するマスが相手の石でない場合は反転不可
  if (!isValidPosition(currentRow, currentCol) ||
      board[currentRow][currentCol] !== opponent) {
    return [];
  }

  // 相手の石が続く限り追跡
  while (isValidPosition(currentRow, currentCol) &&
         board[currentRow][currentCol] === opponent) {
    flippable.push({ row: currentRow, col: currentCol });
    currentRow += dRow;
    currentCol += dCol;
  }

  // 最後が自分の石なら、その間の相手の石を反転できる
  if (isValidPosition(currentRow, currentCol) &&
      board[currentRow][currentCol] === player) {
    return flippable;
  }

  return [];
}

/**
 * 指定位置に石を置いた場合に反転できる石の位置をすべて取得
 */
function getAllFlippablePieces(
  board: Board,
  row: number,
  col: number,
  player: Player
): Position[] {
  if (board[row][col] !== null) {
    return [];
  }

  const allFlippable: Position[] = [];

  for (const [dRow, dCol] of DIRECTIONS) {
    const flippable = getFlippablePiecesInDirection(board, row, col, dRow, dCol, player);
    allFlippable.push(...flippable);
  }

  return allFlippable;
}

/**
 * 指定プレイヤーの合法手をすべて取得
 */
export function getValidMoves(board: Board, player: Player): Position[] {
  const validMoves: Position[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        const flippable = getAllFlippablePieces(board, row, col, player);
        if (flippable.length > 0) {
          validMoves.push({ row, col });
        }
      }
    }
  }

  return validMoves;
}

/**
 * 石を置いて盤面を更新（反転処理込み）
 * 新しい盤面を返す（イミュータブル）
 */
export function makeMove(
  board: Board,
  position: Position,
  player: Player
): { board: Board; capturedCount: number } {
  const newBoard = board.map(row => [...row]);
  const flippable = getAllFlippablePieces(board, position.row, position.col, player);

  if (flippable.length === 0) {
    throw new Error('Invalid move: no pieces to flip');
  }

  // 石を置く
  newBoard[position.row][position.col] = player;

  // 反転
  for (const pos of flippable) {
    newBoard[pos.row][pos.col] = player;
  }

  return {
    board: newBoard,
    capturedCount: flippable.length
  };
}

/**
 * 現在のスコアを計算
 */
export function calculateScore(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 'black') black++;
      if (board[row][col] === 'white') white++;
    }
  }

  return { black, white };
}

/**
 * ゲーム終了判定
 * 両プレイヤーとも合法手がない場合、または盤面が埋まった場合に終了
 */
export function checkGameOver(board: Board): boolean {
  // 盤面が埋まっているかチェック
  const isFull = board.every(row => row.every(cell => cell !== null));
  if (isFull) return true;

  // 両プレイヤーとも合法手がないかチェック
  const blackMoves = getValidMoves(board, 'black');
  const whiteMoves = getValidMoves(board, 'white');

  return blackMoves.length === 0 && whiteMoves.length === 0;
}

/**
 * 勝者を判定
 */
export function getWinner(score: { black: number; white: number }): Player | 'draw' {
  if (score.black > score.white) return 'black';
  if (score.white > score.black) return 'white';
  return 'draw';
}
