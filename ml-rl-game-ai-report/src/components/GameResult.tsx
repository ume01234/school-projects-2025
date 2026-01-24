import type { Player, Board as BoardType } from '../game/types';
import Board from './Board';
import './GameResult.css';

interface GameResultProps {
  winner: Player | 'draw';
  score: { black: number; white: number };
  finalBoard: BoardType;
  onShowQuestionnaire: () => void;
  onPlayAgain: () => void;
}

function GameResult({ winner, score, finalBoard, onShowQuestionnaire, onPlayAgain }: GameResultProps) {
  const getResultMessage = () => {
    if (winner === 'draw') return '引き分け！';
    if (winner === 'black') return '黒の勝利！';
    return '白の勝利！';
  };

  const getResultClass = () => {
    if (winner === 'draw') return 'draw';
    return winner || '';
  };

  return (
    <div className="game-result">
      <div className={`result-message ${getResultClass()}`}>
        <h2>{getResultMessage()}</h2>
      </div>

      <div className="final-score">
        <h3>最終スコア</h3>
        <div className="score-row">
          <div className="score-item">
            <div className="score-piece black"></div>
            <span className="score-label">黒:</span>
            <span className="score-value">{score.black}</span>
          </div>
          <div className="score-separator">-</div>
          <div className="score-item">
            <div className="score-piece white"></div>
            <span className="score-label">白:</span>
            <span className="score-value">{score.white}</span>
          </div>
        </div>
      </div>

      <div className="final-board">
        <h3>最終盤面</h3>
        <div className="final-board-container">
          <Board
            board={finalBoard}
            validMoves={[]}
            onCellClick={() => {}}
            disabled={true}
            mode="normal"
            visibilityMap={null}
            lastAiMove={null}
          />
        </div>
      </div>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onShowQuestionnaire}>
          アンケートに答える
        </button>
        <button className="btn btn-secondary" onClick={onPlayAgain}>
          ホームに戻る
        </button>
      </div>
    </div>
  );
}

export default GameResult;
