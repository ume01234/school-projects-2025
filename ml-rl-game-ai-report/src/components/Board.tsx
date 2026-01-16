import Cell from './Cell';
import type { Board as BoardType, Position } from '../game/types';
import './Board.css';

interface BoardProps {
  board: BoardType;
  validMoves: Position[];
  onCellClick: (position: Position) => void;
  disabled?: boolean;
}

function Board({ board, validMoves, onCellClick, disabled = false }: BoardProps) {
  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
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
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
