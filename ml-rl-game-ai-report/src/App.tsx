import { useState, useEffect } from 'react';
import ModeSelector from './components/ModeSelector';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import GameResult from './components/GameResult';
import { createInitialBoard, getValidMoves, makeMove, calculateScore, checkGameOver, getWinner } from './game/othelloLogic';
import { getRandomMove } from './game/randomAI';
import { generateVisibilityMap, getModeTitleJapanese } from './game/visibilityUtils';
import type { GameMode, GameState } from './game/types';
import './App.css';

type ViewState = 'mode-select' | 'playing' | 'result';

function App() {
  const [viewState, setViewState] = useState<ViewState>('mode-select');
  const [selectedMode, setSelectedMode] = useState<GameMode>('blindfold1');
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'black',
    validMoves: [],
    score: { black: 2, white: 2 },
    isGameOver: false,
    winner: null
  });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [visibilityMap, setVisibilityMap] = useState<boolean[][] | null>(null);
  const [lastAiMove, setLastAiMove] = useState<{ row: number; col: number } | null>(null);
  const [showMiss, setShowMiss] = useState(false);

  const startGame = (mode: GameMode) => {
    setSelectedMode(mode);

    const initialBoard = createInitialBoard();
    setGameState({
      board: initialBoard,
      currentPlayer: 'black',
      validMoves: getValidMoves(initialBoard, 'black'),
      score: calculateScore(initialBoard),
      isGameOver: false,
      winner: null
    });

    setVisibilityMap(generateVisibilityMap(mode));
    setLastAiMove(null);
    setShowMiss(false);
    setViewState('playing');
  };

  const handleCellClick = (position: { row: number; col: number }) => {
    if (gameState.isGameOver || gameState.currentPlayer !== 'black' || isAiThinking) {
      return;
    }

    const isValid = gameState.validMoves.some(
      (move) => move.row === position.row && move.col === position.col
    );

    if (!isValid) {
      // 不正な手はパス扱い、ミス表示
      setShowMiss(true);
      setTimeout(() => setShowMiss(false), 1000);
      handlePass();
      return;
    }

    executeMove(position);
  };

  const executeMove = (position: { row: number; col: number }) => {
    const { board: newBoard } = makeMove(
      gameState.board,
      position,
      gameState.currentPlayer
    );

    const newScore = calculateScore(newBoard);
    const isOver = checkGameOver(newBoard);
    const opponent = gameState.currentPlayer === 'black' ? 'white' : 'black';

    setGameState({
      board: newBoard,
      currentPlayer: opponent,
      validMoves: getValidMoves(newBoard, opponent),
      score: newScore,
      isGameOver: isOver,
      winner: isOver ? getWinner(newScore) : null
    });
  };

  const handlePass = () => {
    const opponent = gameState.currentPlayer === 'black' ? 'white' : 'black';
    const opponentValidMoves = getValidMoves(gameState.board, opponent);

    if (opponentValidMoves.length === 0) {
      setGameState({
        ...gameState,
        isGameOver: true,
        winner: getWinner(gameState.score)
      });
      return;
    }

    setGameState({
      ...gameState,
      currentPlayer: opponent,
      validMoves: opponentValidMoves
    });
  };

  // AIの手番処理
  useEffect(() => {
    if (
      viewState !== 'playing' ||
      gameState.currentPlayer !== 'white' ||
      gameState.isGameOver ||
      isAiThinking
    ) {
      return;
    }

    if (gameState.validMoves.length === 0) {
      setTimeout(handlePass, 2000);
      return;
    }

    setIsAiThinking(true);
    setTimeout(() => {
      const aiMove = getRandomMove(gameState.validMoves);
      executeMove(aiMove);
      setLastAiMove(aiMove);
      setIsAiThinking(false);
    }, 2000);
  }, [gameState.currentPlayer, viewState, gameState.isGameOver, isAiThinking]);

  // ゲーム終了時の処理
  useEffect(() => {
    if (gameState.isGameOver && viewState === 'playing') {
      setViewState('result');
    }
  }, [gameState.isGameOver]);

  return (
    <div className="app">
      {viewState === 'mode-select' && (
        <ModeSelector onSelectMode={startGame} />
      )}

      {viewState === 'playing' && (
        <div className="game-screen">
          <h1 className="game-title">{getModeTitleJapanese(selectedMode)}</h1>

          <div className="game-content">
            <div className="game-sidebar">
              <GameInfo
                currentPlayer={gameState.currentPlayer}
                score={gameState.score}
                canPass={gameState.validMoves.length === 0 && gameState.currentPlayer === 'black'}
                onPass={handlePass}
                mode={selectedMode}
                showMiss={showMiss}
              />
              {isAiThinking && <div className="ai-thinking">AIが考え中...</div>}
              <button className="quit-button" onClick={() => setViewState('mode-select')}>
                中断してホームに戻る
              </button>
            </div>

            <div className="board-container">
              <Board
                board={gameState.board}
                onCellClick={handleCellClick}
                disabled={gameState.currentPlayer === 'white' || isAiThinking}
                mode={selectedMode}
                visibilityMap={visibilityMap}
                lastAiMove={lastAiMove}
              />
            </div>
          </div>
        </div>
      )}

      {viewState === 'result' && (
        <GameResult
          winner={gameState.winner || 'draw'}
          score={gameState.score}
          finalBoard={gameState.board}
          onPlayAgain={() => setViewState('mode-select')}
        />
      )}
    </div>
  );
}

export default App;
