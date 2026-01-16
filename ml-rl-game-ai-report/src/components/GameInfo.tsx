import type { Player } from '../game/types';
import './GameInfo.css';

interface GameInfoProps {
  currentPlayer: Player;
  score: { black: number; white: number };
  canPass: boolean;
  onPass: () => void;
}

function GameInfo({ currentPlayer, score, canPass, onPass }: GameInfoProps) {
  return (
    <div className="game-info">
      <div className="turn-indicator">
        <div className={`turn-display ${currentPlayer}`}>
          <div className={`turn-piece ${currentPlayer}`}></div>
          <span>{currentPlayer === 'black' ? '黒のターン' : '白のターン'}</span>
        </div>
      </div>

      <div className="score-display">
        <div className="score-item">
          <div className="score-piece black"></div>
          <span className="score-label">黒:</span>
          <span className="score-value">{score.black}</span>
        </div>
        <div className="score-item">
          <div className="score-piece white"></div>
          <span className="score-label">白:</span>
          <span className="score-value">{score.white}</span>
        </div>
      </div>

      {canPass && (
        <button className="pass-button" onClick={onPass}>
          パス（置ける場所がありません）
        </button>
      )}
    </div>
  );
}

export default GameInfo;
