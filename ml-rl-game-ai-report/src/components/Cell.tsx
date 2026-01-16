import type { Player, GameMode } from '../game/types';
import './Cell.css';

interface CellProps {
  player: Player;
  isValidMove: boolean;
  onClick: () => void;
  isVisible: boolean;
  mode: GameMode;
}

function Cell({ player, isValidMove, onClick, isVisible, mode }: CellProps) {
  // 石を表示するかどうか判定
  const shouldShowPiece = () => {
    if (!player) return false;
    if (mode === 'blindfold3') return false; // 重度モードでは全て非表示
    if (!isVisible) return false;             // 可視性マップでfalseなら非表示
    return true;
  };

  return (
    <div
      className={`cell ${isValidMove ? 'valid-move' : ''} ${!isVisible ? 'hidden-cell' : ''}`}
      onClick={isValidMove ? onClick : undefined}
    >
      {shouldShowPiece() && (
        <div className={`piece ${player}`}></div>
      )}
      {isValidMove && <div className="move-marker"></div>}
    </div>
  );
}

export default Cell;
