import type { GameMode } from './types';

/**
 * モードに応じた可視性マップを生成
 * @param mode - ゲームモード
 * @returns 可視性マップ (null = 全て可視, boolean[][] = 各セルの可視性)
 */
export function generateVisibilityMap(mode: GameMode): boolean[][] | null {
  if (mode === 'normal') return null;

  const map: boolean[][] = Array(8).fill(null).map(() => Array(8).fill(true));

  switch (mode) {
    case 'blindfold1':
      return generateBlindfold1Map(map);
    case 'blindfold2':
      return generateBlindfold2Map(map);
    case 'blindfold3':
      return null; // ロジックベースで非表示
    default:
      return null;
  }
}

/**
 * blindfold1: 外周のみ非表示（28セル）
 */
function generateBlindfold1Map(map: boolean[][]): boolean[][] {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (row === 0 || row === 7 || col === 0 || col === 7) {
        map[row][col] = false;
      }
    }
  }
  return map;
}

/**
 * blindfold2: ランダムに50%（32セル）
 * Fisher-Yates シャッフルで均等分布
 */
function generateBlindfold2Map(map: boolean[][]): boolean[][] {
  const positions: Array<[number, number]> = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      positions.push([row, col]);
    }
  }

  // Fisher-Yates シャッフル
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // 最初の32セルを非表示（50%）
  for (let i = 0; i < 32; i++) {
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
    'normal': 'オセロ - 通常モード',
    'blindfold1': 'オセロ - 目隠しモード（軽度）',
    'blindfold2': 'オセロ - 目隠しモード（中程度）',
    'blindfold3': 'オセロ - 目隠しモード（重度）',
    'strong-ai': 'オセロ - 最強AIモード',
    'hospitality-ai': 'オセロ - 接待AIモード'
  };
  return titles[mode];
}
