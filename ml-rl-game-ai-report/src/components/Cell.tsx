import type { Player, GameMode } from '../game/types';
import './Cell.css';

interface CellProps {
  player: Player;
  isValidMove: boolean;
  onClick: () => void;
  isVisible: boolean;
  mode: GameMode;
  isLastAiMove: boolean;
  isClickable: boolean;
  row: number;
  col: number;
}

function Cell({ player, isValidMove, onClick, isVisible, mode, isLastAiMove, isClickable, row, col }: CellProps) {
  // 目隠しモードかどうか
  const isBlindfoldMode = mode !== 'normal';

  // 中央4マスかどうか判定
  const isCenterCell = (row === 3 || row === 4) && (col === 3 || col === 4);

  // 石を表示するかどうか判定
  const shouldShowPiece = () => {
    if (!player) return false;
    if (mode === 'blindfold3') {
      // 重度モードでは中央4マスのみ表示
      return isCenterCell;
    }
    if (!isVisible) return false;             // 可視性マップでfalseなら非表示
    return true;
  };

  // クリック可能かどうか
  const canClick = isClickable;

  // 合法手マーカーを表示するか（通常モードのみ）
  const showMoveMarker = isValidMove && !isBlindfoldMode;

  return (
    <div
      className={`cell ${isValidMove && !isBlindfoldMode ? 'valid-move' : ''} ${canClick && isBlindfoldMode ? 'clickable' : ''} ${!isVisible ? 'hidden-cell' : ''} ${isLastAiMove ? 'last-ai-move' : ''}`}
      onClick={canClick ? onClick : undefined}
    >
      {shouldShowPiece() && (
        <div className={`piece ${player}`}></div>
      )}
      {showMoveMarker && <div className="move-marker"></div>}
    </div>
  );
}

export default Cell;
