import type { Player, GameMode } from '../game/types';
import './GameInfo.css';

interface GameInfoProps {
  currentPlayer: Player;
  score: { black: number; white: number };
  canPass: boolean;
  onPass: () => void;
  mode: GameMode;
  showMiss: boolean;
}

const modeRules: Record<GameMode, string> = {
  'blindfold1': '外周が見えません',
  'blindfold2': '盤面の半分がランダムに見えません',
  'blindfold3': '中央4マス以外見えません'
};

function GameInfo({ currentPlayer, score, canPass, onPass, mode, showMiss }: GameInfoProps) {
  return (
    <div className="game-info">
      <div className="rules-section">
        <h3 className="rules-title">ルール</h3>
        <ul className="rules-list">
          <li>黒（先攻）があなたです</li>
          <li>{modeRules[mode]}</li>
          <li>合法手は表示されません</li>
          <li>置けない場所に置くとパスになります</li>
          <li>AIの手は赤枠で表示されます</li>
        </ul>
      </div>

      <div className="turn-indicator">
        {showMiss ? (
          <div className="turn-display miss">
            <span>Miss!</span>
          </div>
        ) : (
          <div className={`turn-display ${currentPlayer}`}>
            <div className={`turn-piece ${currentPlayer}`}></div>
            <span>{currentPlayer === 'black' ? '黒のターン' : '白のターン'}</span>
          </div>
        )}
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
