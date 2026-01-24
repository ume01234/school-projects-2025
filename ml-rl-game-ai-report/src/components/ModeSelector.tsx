import type { GameMode } from '../game/types';
import './ModeSelector.css';

interface ModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
}

const modes: { mode: GameMode; title: string; description: string }[] = [
  {
    mode: 'blindfold1',
    title: '目隠し（軽度）',
    description: '外周が見えません'
  },
  {
    mode: 'blindfold2',
    title: '目隠し（中程度）',
    description: '盤面の半分が見えません'
  },
  {
    mode: 'blindfold3',
    title: '目隠し（重度）',
    description: '中央4マス以外見えません'
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
            className="mode-card"
            onClick={() => onSelectMode(modeInfo.mode)}
          >
            <h3 className="mode-title">{modeInfo.title}</h3>
            <p className="mode-description">{modeInfo.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ModeSelector;
