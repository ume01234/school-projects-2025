import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import type { GameLog, QuestionnaireResponse } from '../game/types';

/**
 * ゲームID生成（UUID v4）
 */
export function generateGameId(): string {
  return crypto.randomUUID();
}

/**
 * 対局ログをFirestoreに保存
 */
export async function saveGameLog(gameLog: GameLog): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firebase not configured. Game log not saved:', gameLog);
    return;
  }

  try {
    const docRef = await addDoc(collection(db, 'gameLogs'), {
      ...gameLog,
      startTime: Timestamp.fromMillis(gameLog.startTime),
      endTime: Timestamp.fromMillis(gameLog.endTime),
      moves: gameLog.moves.map(move => ({
        ...move,
        timestamp: Timestamp.fromMillis(move.timestamp)
      }))
    });
    console.log('Game log saved with ID:', docRef.id);
  } catch (error) {
    console.error('Error saving game log:', error);
    throw error;
  }
}

/**
 * アンケート回答をFirestoreに保存
 */
export async function saveQuestionnaire(response: QuestionnaireResponse): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firebase not configured. Questionnaire not saved:', response);
    return;
  }

  try {
    const docRef = await addDoc(collection(db, 'questionnaires'), {
      ...response,
      submittedAt: Timestamp.now()
    });
    console.log('Questionnaire saved with ID:', docRef.id);
  } catch (error) {
    console.error('Error saving questionnaire:', error);
    throw error;
  }
}
