import type { Player } from '../game/types';
import './Cell.css';

interface CellProps {
  player: Player;
  isValidMove: boolean;
  onClick: () => void;
}

function Cell({ player, isValidMove, onClick }: CellProps) {
  return (
    <div
      className={`cell ${isValidMove ? 'valid-move' : ''}`}
      onClick={isValidMove ? onClick : undefined}
    >
      {player && (
        <div className={`piece ${player}`}></div>
      )}
      {isValidMove && <div className="move-marker"></div>}
    </div>
  );
}

export default Cell;
