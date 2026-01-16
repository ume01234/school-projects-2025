import { useState } from 'react';
import './Questionnaire.css';

interface QuestionnaireProps {
  onSubmit: (data: QuestionnaireData) => void;
  onSkip: () => void;
}

export interface QuestionnaireData {
  nickname?: string;
  difficulty: number;
  enjoyment: number;
  tension: number;
  frustration: number;
  playAgain: number;
  comments?: string;
}

function Questionnaire({ onSubmit, onSkip }: QuestionnaireProps) {
  const [nickname, setNickname] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [enjoyment, setEnjoyment] = useState(3);
  const [tension, setTension] = useState(3);
  const [frustration, setFrustration] = useState(3);
  const [playAgain, setPlayAgain] = useState(3);
  const [comments, setComments] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nickname: nickname.trim() || undefined,
      difficulty,
      enjoyment,
      tension,
      frustration,
      playAgain,
      comments: comments.trim() || undefined
    });
  };

  return (
    <div className="questionnaire">
      <h2>アンケート</h2>
      <p className="questionnaire-description">
        ゲームの体験について教えてください（任意）
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ニックネーム（任意）</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="匿名でも構いません"
            className="text-input"
          />
        </div>

        <div className="form-group">
          <label>難しさ</label>
          <div className="scale-labels">
            <span>簡単</span>
            <span>難しい</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="range-input"
          />
          <div className="scale-value">{difficulty}</div>
        </div>

        <div className="form-group">
          <label>楽しさ</label>
          <div className="scale-labels">
            <span>つまらない</span>
            <span>楽しい</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={enjoyment}
            onChange={(e) => setEnjoyment(Number(e.target.value))}
            className="range-input"
          />
          <div className="scale-value">{enjoyment}</div>
        </div>

        <div className="form-group">
          <label>緊張感</label>
          <div className="scale-labels">
            <span>低い</span>
            <span>高い</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={tension}
            onChange={(e) => setTension(Number(e.target.value))}
            className="range-input"
          />
          <div className="scale-value">{tension}</div>
        </div>

        <div className="form-group">
          <label>イライラ度</label>
          <div className="scale-labels">
            <span>低い</span>
            <span>高い</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={frustration}
            onChange={(e) => setFrustration(Number(e.target.value))}
            className="range-input"
          />
          <div className="scale-value">{frustration}</div>
        </div>

        <div className="form-group">
          <label>もう一度プレイしたいか</label>
          <div className="scale-labels">
            <span>したくない</span>
            <span>したい</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={playAgain}
            onChange={(e) => setPlayAgain(Number(e.target.value))}
            className="range-input"
          />
          <div className="scale-value">{playAgain}</div>
        </div>

        <div className="form-group">
          <label>自由記述（任意）</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="感想や気づいたことがあれば..."
            rows={4}
            className="textarea-input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            送信
          </button>
          <button type="button" onClick={onSkip} className="btn btn-secondary">
            スキップ
          </button>
        </div>
      </form>
    </div>
  );
}

export default Questionnaire;
