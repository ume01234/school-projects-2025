import { useState, useEffect, useRef } from 'react';
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
  const aiTimerRef = useRef<number | null>(null);

  const startGame = (mode: GameMode) => {
    // タイマーをクリア
    if (aiTimerRef.current !== null) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    setIsAiThinking(false);

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
    setGameState(prev => {
      const { board: newBoard } = makeMove(prev.board, position, prev.currentPlayer);
      const newScore = calculateScore(newBoard);
      const isOver = checkGameOver(newBoard);
      const opponent = prev.currentPlayer === 'black' ? 'white' : 'black';

      return {
        board: newBoard,
        currentPlayer: opponent,
        validMoves: getValidMoves(newBoard, opponent),
        score: newScore,
        isGameOver: isOver,
        winner: isOver ? getWinner(newScore) : null
      };
    });
  };

  const handlePass = () => {
    setGameState(prev => {
      const opponent = prev.currentPlayer === 'black' ? 'white' : 'black';
      const opponentValidMoves = getValidMoves(prev.board, opponent);

      if (opponentValidMoves.length === 0) {
        return {
          ...prev,
          isGameOver: true,
          winner: getWinner(prev.score)
        };
      }

      return {
        ...prev,
        currentPlayer: opponent,
        validMoves: opponentValidMoves
      };
    });
  };

  // AIの手番処理
  useEffect(() => {
    // 既にタイマーが動いている場合は何もしない
    if (aiTimerRef.current !== null) {
      return;
    }

    if (
      viewState !== 'playing' ||
      gameState.currentPlayer !== 'white' ||
      gameState.isGameOver
    ) {
      return;
    }

    const validMoves = gameState.validMoves;

    if (validMoves.length === 0) {
      // AIがパスする場合
      aiTimerRef.current = window.setTimeout(() => {
        aiTimerRef.current = null;
        setGameState(prev => {
          const blackValidMoves = getValidMoves(prev.board, 'black');
          if (blackValidMoves.length === 0) {
            return { ...prev, isGameOver: true, winner: getWinner(prev.score) };
          }
          return { ...prev, currentPlayer: 'black', validMoves: blackValidMoves };
        });
      }, 2000);
      return;
    }

    setIsAiThinking(true);
    const aiMove = getRandomMove(validMoves);

    aiTimerRef.current = window.setTimeout(() => {
      aiTimerRef.current = null;
      setGameState(prev => {
        const { board: newBoard } = makeMove(prev.board, aiMove, 'white');
        const newScore = calculateScore(newBoard);
        const isOver = checkGameOver(newBoard);
        return {
          board: newBoard,
          currentPlayer: 'black',
          validMoves: getValidMoves(newBoard, 'black'),
          score: newScore,
          isGameOver: isOver,
          winner: isOver ? getWinner(newScore) : null
        };
      });
      setLastAiMove(aiMove);
      setIsAiThinking(false);
    }, 2000);
  }, [gameState.currentPlayer, gameState.isGameOver, gameState.validMoves, viewState]);

  // ゲーム終了時の処理
  useEffect(() => {
    if (gameState.isGameOver && viewState === 'playing') {
      setViewState('result');
    }
  }, [gameState.isGameOver, viewState]);

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
              <button className="quit-button" onClick={() => {
                if (aiTimerRef.current !== null) {
                  clearTimeout(aiTimerRef.current);
                  aiTimerRef.current = null;
                }
                setIsAiThinking(false);
                setViewState('mode-select');
              }}>
                ホームに戻る
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
