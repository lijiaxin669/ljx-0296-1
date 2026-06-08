import { ScoreRecord } from '../types';
import { RANK_MESSAGES } from '../config/gameConfig';

const STORAGE_KEY = 'red_packet_game_scores';
const HIGH_SCORE_KEY = 'red_packet_high_score';
const MAX_RECORDS = 10;

export class ScoreManager {
  static saveScore(score: number, maxCombo: number): void {
    try {
      const records = this.getScoreRecords();
      const newRecord: ScoreRecord = {
        score,
        maxCombo,
        date: new Date().toLocaleDateString('zh-CN'),
      };
      records.push(newRecord);
      records.sort((a, b) => b.score - a.score);
      const topRecords = records.slice(0, MAX_RECORDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(topRecords));

      const highScore = this.getHighScore();
      if (score > highScore) {
        localStorage.setItem(HIGH_SCORE_KEY, String(score));
      }
    } catch (e) {
      console.error('保存分数失败:', e);
    }
  }

  static getHighScore(): number {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  static getScoreRecords(): ScoreRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  static getRankMessage(score: number): string {
    const records = this.getScoreRecords();
    if (records.length === 0) {
      return '首次游玩，继续努力！';
    }
    const scores = records.map((r) => r.score);
    const allScores = [...scores, score];
    allScores.sort((a, b) => b - a);
    const rank = allScores.indexOf(score) + 1;
    const percentile = Math.round((1 - rank / allScores.length) * 100);

    for (const rankMsg of RANK_MESSAGES) {
      if (percentile >= rankMsg.threshold) {
        return rankMsg.message;
      }
    }
    return '继续加油！';
  }

  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(HIGH_SCORE_KEY);
  }
}
