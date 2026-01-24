import type { Player, GameMode } from '../game/types';
import './Cell.css';

interface CellProps {
  player: Player;
  onClick: () => void;
  isVisible: boolean;
  mode: GameMode;
  isLastAiMove: boolean;
  isClickable: boolean;
  row: number;
  col: number;
}

function Cell({ player, onClick, isVisible, mode, isLastAiMove, isClickable, row, col }: CellProps) {
  const isCenterCell = (row === 3 || row === 4) && (col === 3 || col === 4);

  const shouldShowPiece = () => {
    if (!player) return false;
    if (mode === 'blindfold3') return isCenterCell;
    return isVisible;
  };

  const classNames = [
    'cell',
    isClickable && 'clickable',
    !isVisible && 'hidden-cell',
    isLastAiMove && 'last-ai-move'
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} onClick={isClickable ? onClick : undefined}>
      {shouldShowPiece() && <div className={`piece ${player}`} />}
    </div>
  );
}

export default Cell;
