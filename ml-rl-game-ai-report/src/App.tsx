import { useState, useEffect } from 'react';
import ModeSelector from './components/ModeSelector';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import GameResult from './components/GameResult';
import Questionnaire, { QuestionnaireData } from './components/Questionnaire';
import { createInitialBoard, getValidMoves, makeMove, calculateScore, checkGameOver, getWinner } from './game/othelloLogic';
import { getRandomMove } from './game/randomAI';
import { generateGameId, saveGameLog, saveQuestionnaire } from './firebase/firestore';
import { generateVisibilityMap, getModeTitleJapanese } from './game/visibilityUtils';
import type { GameMode, GameState, Move, GameLog } from './game/types';
import './App.css';

type ViewState = 'mode-select' | 'playing' | 'result' | 'questionnaire';

function App() {
  const [viewState, setViewState] = useState<ViewState>('mode-select');
  const [selectedMode, setSelectedMode] = useState<GameMode>('normal');
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'black',
    validMoves: [],
    score: { black: 2, white: 2 },
    moveHistory: [],
    isGameOver: false,
    winner: null
  });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameId, setGameId] = useState<string>('');
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [visibilityMap, setVisibilityMap] = useState<boolean[][] | null>(null);

  // ゲーム開始
  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    const newGameId = generateGameId();
    setGameId(newGameId);
    setGameStartTime(Date.now());

    const initialBoard = createInitialBoard();
    const validMoves = getValidMoves(initialBoard, 'black');

    setGameState({
      board: initialBoard,
      currentPlayer: 'black',
      validMoves,
      score: calculateScore(initialBoard),
      moveHistory: [],
      isGameOver: false,
      winner: null
    });

    // 可視性マップを生成
    const visibility = generateVisibilityMap(mode);
    setVisibilityMap(visibility);

    setViewState('playing');
  };

  // セルクリックハンドラ
  const handleCellClick = (position: { row: number; col: number }) => {
    if (gameState.isGameOver || gameState.currentPlayer !== 'black' || isAiThinking) {
      return;
    }

    // 合法手かチェック
    const isValid = gameState.validMoves.some(
      (move) => move.row === position.row && move.col === position.col
    );

    if (!isValid) {
      return;
    }

    executeMove(position);
  };

  // 手を実行
  const executeMove = (position: { row: number; col: number }) => {
    const { board: newBoard, capturedCount } = makeMove(
      gameState.board,
      position,
      gameState.currentPlayer
    );

    const move: Move = {
      player: gameState.currentPlayer,
      position,
      timestamp: Date.now(),
      capturedCount
    };

    const newMoveHistory = [...gameState.moveHistory, move];
    const newScore = calculateScore(newBoard);
    const isOver = checkGameOver(newBoard);
    const opponent = gameState.currentPlayer === 'black' ? 'white' : 'black';
    const opponentValidMoves = getValidMoves(newBoard, opponent);

    setGameState({
      board: newBoard,
      currentPlayer: opponent,
      validMoves: opponentValidMoves,
      score: newScore,
      moveHistory: newMoveHistory,
      isGameOver: isOver,
      winner: isOver ? getWinner(newScore) : null
    });
  };

  // パス処理
  const handlePass = () => {
    const opponent = gameState.currentPlayer === 'black' ? 'white' : 'black';
    const opponentValidMoves = getValidMoves(gameState.board, opponent);

    // 相手も合法手がなければゲーム終了
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
      viewState === 'playing' &&
      gameState.currentPlayer === 'white' &&
      !gameState.isGameOver &&
      !isAiThinking
    ) {
      if (gameState.validMoves.length === 0) {
        // AIもパス
        setTimeout(() => {
          handlePass();
        }, 500);
        return;
      }

      setIsAiThinking(true);
      setTimeout(() => {
        const aiMove = getRandomMove(gameState.validMoves);
        executeMove(aiMove);
        setIsAiThinking(false);
      }, 500);
    }
  }, [gameState.currentPlayer, viewState, gameState.isGameOver, isAiThinking]);

  // ゲーム終了時の処理
  useEffect(() => {
    if (gameState.isGameOver && viewState === 'playing') {
      // ゲームログを保存
      const gameLog: GameLog = {
        gameId,
        mode: selectedMode,
        startTime: gameStartTime,
        endTime: Date.now(),
        moves: gameState.moveHistory,
        finalScore: gameState.score,
        winner: gameState.winner || 'draw'
      };

      saveGameLog(gameLog).catch(console.error);

      setViewState('result');
    }
  }, [gameState.isGameOver]);

  // アンケート送信
  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    const response = {
      gameId,
      ...data
    };

    saveQuestionnaire(response).catch(console.error);

    // モード選択画面に戻る
    setViewState('mode-select');
  };

  // アンケートスキップ
  const handleQuestionnaireSkip = () => {
    setViewState('mode-select');
  };

  // 結果画面からアンケート表示
  const handleShowQuestionnaire = () => {
    setViewState('questionnaire');
  };

  // もう一度プレイ
  const handlePlayAgain = () => {
    setViewState('mode-select');
  };

  return (
    <div className="app">
      {viewState === 'mode-select' && (
        <ModeSelector onSelectMode={handleModeSelect} />
      )}

      {viewState === 'playing' && (
        <div className="game-screen">
          <div className="game-header">
            <h1 className="game-title">{getModeTitleJapanese(selectedMode)}</h1>

            <GameInfo
              currentPlayer={gameState.currentPlayer}
              score={gameState.score}
              canPass={gameState.validMoves.length === 0 && gameState.currentPlayer === 'black'}
              onPass={handlePass}
            />
          </div>

          <div className="board-container">
            <Board
              board={gameState.board}
              validMoves={gameState.validMoves}
              onCellClick={handleCellClick}
              disabled={gameState.currentPlayer === 'white' || isAiThinking}
              mode={selectedMode}
              visibilityMap={visibilityMap}
            />
            {isAiThinking && (
              <div className="ai-thinking">AIが考え中...</div>
            )}
          </div>
        </div>
      )}

      {viewState === 'result' && (
        <GameResult
          winner={gameState.winner || 'draw'}
          score={gameState.score}
          finalBoard={gameState.board}
          onShowQuestionnaire={handleShowQuestionnaire}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {viewState === 'questionnaire' && (
        <Questionnaire
          onSubmit={handleQuestionnaireSubmit}
          onSkip={handleQuestionnaireSkip}
        />
      )}
    </div>
  );
}

export default App;
