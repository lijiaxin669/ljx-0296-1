export interface RedPacketConfig {
  type: 'small' | 'medium' | 'large';
  score: number;
  color: number;
  size: number;
  weight: number;
  label: string;
}

export interface GameState {
  score: number;
  lives: number;
  combo: number;
  maxCombo: number;
  timeLeft: number;
  difficulty: number;
  isPaused: boolean;
}

export interface ScoreRecord {
  score: number;
  date: string;
  maxCombo: number;
}
