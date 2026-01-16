import Cell from './Cell';
import type { Board as BoardType, Position, GameMode } from '../game/types';
import './Board.css';

interface BoardProps {
  board: BoardType;
  validMoves: Position[];
  onCellClick: (position: Position) => void;
  disabled?: boolean;
  mode: GameMode;
  visibilityMap: boolean[][] | null;
}

function Board({ board, validMoves, onCellClick, disabled = false, mode, visibilityMap }: BoardProps) {
  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  // セルの可視性判定
  const isCellVisible = (row: number, col: number): boolean => {
    if (visibilityMap === null) return true; // 通常モード
    return visibilityMap[row][col];
  };

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              player={cell}
              isValidMove={!disabled && isValidMove(rowIndex, colIndex)}
              onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
              isVisible={isCellVisible(rowIndex, colIndex)}
              mode={mode}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
