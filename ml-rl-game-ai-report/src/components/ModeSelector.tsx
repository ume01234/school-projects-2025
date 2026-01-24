import type { GameMode } from '../game/types';
import './ModeSelector.css';

interface ModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
}

interface ModeInfo {
  mode: GameMode;
  title: string;
  description: string;
  available: boolean;
}

const modes: ModeInfo[] = [
  {
    mode: 'normal',
    title: '通常オセロ',
    description: 'ランダムAIと対戦します',
    available: true
  },
  {
    mode: 'blindfold1',
    title: '目隠しオセロ（軽度）',
    description: '盤面の一部が見えません',
    available: true
  },
  {
    mode: 'blindfold2',
    title: '目隠しオセロ（中程度）',
    description: '盤面の半分が見えません',
    available: true
  },
  {
    mode: 'blindfold3',
    title: '目隠しオセロ（重度）',
    description: '合法手のみ表示されます',
    available: true
  }
];

function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <h1 className="title">目隠しリバーシ</h1>
      <p className="subtitle">モードを選択してください</p>

      <div className="modes-grid">
        {modes.map((modeInfo) => (
          <button
            key={modeInfo.mode}
            className={`mode-card ${!modeInfo.available ? 'disabled' : ''}`}
            onClick={() => modeInfo.available && onSelectMode(modeInfo.mode)}
            disabled={!modeInfo.available}
          >
            <h3 className="mode-title">{modeInfo.title}</h3>
            <p className="mode-description">{modeInfo.description}</p>
            {!modeInfo.available && (
              <span className="coming-soon">Coming Soon</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ModeSelector;
