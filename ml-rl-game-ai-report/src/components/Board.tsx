import Cell from './Cell';
import type { Board as BoardType, Position, GameMode } from '../game/types';
import './Board.css';

interface BoardProps {
  board: BoardType;
  onCellClick: (position: Position) => void;
  disabled?: boolean;
  mode: GameMode;
  visibilityMap: boolean[][] | null;
  lastAiMove: { row: number; col: number } | null;
}

function Board({ board, onCellClick, disabled = false, mode, visibilityMap, lastAiMove }: BoardProps) {
  const isCellVisible = (row: number, col: number) =>
    visibilityMap === null || visibilityMap[row][col];

  const isLastAiMoveCell = (row: number, col: number) =>
    lastAiMove?.row === row && lastAiMove?.col === col;

  // 空のセルならクリック可能
  const isCellClickable = (cell: typeof board[0][0]) =>
    !disabled && cell === null;

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              player={cell}
              onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
              isVisible={isCellVisible(rowIndex, colIndex)}
              mode={mode}
              isLastAiMove={isLastAiMoveCell(rowIndex, colIndex)}
              isClickable={isCellClickable(cell)}
              row={rowIndex}
              col={colIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
