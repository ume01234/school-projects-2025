import type { GameMode } from './types';

const BOARD_SIZE = 8;

/**
 * モードに応じた可視性マップを生成
 * true = 見える, false = 見えない
 * blindfold3はnullを返す（Cell側で中央4マスのみ表示を制御）
 */
export function generateVisibilityMap(mode: GameMode): boolean[][] | null {
  switch (mode) {
    case 'blindfold1':
      return generateEdgeHiddenMap();
    case 'blindfold2':
      return generateRandomHiddenMap();
    case 'blindfold3':
      return null;
  }
}

/**
 * blindfold1: 外周を非表示
 */
function generateEdgeHiddenMap(): boolean[][] {
  const map: boolean[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    map[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const isEdge = row === 0 || row === 7 || col === 0 || col === 7;
      map[row][col] = !isEdge;
    }
  }
  return map;
}

/**
 * blindfold2: ランダムに50%を非表示
 */
function generateRandomHiddenMap(): boolean[][] {
  const positions: [number, number][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      positions.push([row, col]);
    }
  }

  // Fisher-Yates シャッフル
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  const map: boolean[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(true));
  const hideCount = Math.floor(positions.length / 2);
  for (let i = 0; i < hideCount; i++) {
    const [row, col] = positions[i];
    map[row][col] = false;
  }

  return map;
}

/**
 * モード名を日本語タイトルに変換
 */
export function getModeTitleJapanese(mode: GameMode): string {
  const titles: Record<GameMode, string> = {
    'blindfold1': '目隠しリバーシ（軽度）',
    'blindfold2': '目隠しリバーシ（中程度）',
    'blindfold3': '目隠しリバーシ（重度）'
  };
  return titles[mode];
}
